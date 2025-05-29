package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"
	"github.com/robfig/cron/v3"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoClient *mongo.Client
var db *mongo.Database
var MONGO_URI string
var resend_apiKey string

var (
	updateCollection        *mongo.Collection
	subscriptionsCollection *mongo.Collection
)

type Update struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Writer    primitive.ObjectID `bson:"writer_id"`
	Title     string             `bson:"title"`
	Body      string             `bson:"body"`
	Sent      bool               `bson:"sent"`
	CreatedAt time.Time          `bson:"created_at"`
}

type Subscription struct {
	ID              primitive.ObjectID `bson:"_id,omitempty"`
	WriterID        primitive.ObjectID `bson:"writer_id"`
	SubscriberEmail string             `bson:"subscriber_email"`
}

func initMongo() {
	fmt.Println("[DEBUG] Initializing MongoDB connection...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(MONGO_URI))
	if err != nil {
		log.Fatal("[ERROR] MongoDB connection failed:", err)
	}
	mongoClient = client
	db = client.Database("round3")
	updateCollection = db.Collection("updates")
	subscriptionsCollection = db.Collection("subscriptions")
	fmt.Println("[DEBUG] MongoDB connection initialized.")
}

func main() {
	fmt.Println("[DEBUG] Loading environment variables...")
	godotenv.Load()
	MONGO_URI = os.Getenv("MONGO_URI")
	resend_apiKey = os.Getenv("RESEND_API_KEY")
	fmt.Printf("[DEBUG] MONGO_URI: %s\n", MONGO_URI)
	fmt.Printf("[DEBUG] RESEND_API_KEY loaded: %v\n", resend_apiKey != "")

	initMongo()

	fmt.Println("[DEBUG] Starting cron job...")
	c := cron.New()
	c.AddFunc("@every 15m", func() {
		fmt.Println("[DEBUG] Cron job triggered: sendPendingMail()")
		sendPendingMail()
	})
	c.Start()

	fmt.Println("[DEBUG] Main goroutine entering infinite loop.")
	select {}
}

func sendPendingMail() {
	fmt.Println("[DEBUG] Checking for unsent updates in DB...")
	ctx := context.Background()
	filter := bson.M{"sent": false}

	cursor, err := updateCollection.Find(ctx, filter)
	if err != nil {
		log.Println("[ERROR] Error fetching updates:", err)
		return
	}
	defer cursor.Close(ctx)

	found := false
	for cursor.Next(ctx) {
		found = true
		var update Update
		if err := cursor.Decode(&update); err != nil {
			log.Println("[ERROR] Decode error:", err)
			continue
		}
		fmt.Printf("[DEBUG] Found update: ID=%s, Title=%s, Writer=%s\n", update.ID.Hex(), update.Title, update.Writer.Hex())

		// Find all subscriptions for this writer
		subCursor, err := subscriptionsCollection.Find(ctx, bson.M{"writer_id": update.Writer})
		if err != nil {
			log.Println("[ERROR] Error fetching subscriptions:", err)
			continue
		}

		var subscribers []Subscription
		if err := subCursor.All(ctx, &subscribers); err != nil {
			log.Println("[ERROR] Error decoding subscriptions:", err)
			subCursor.Close(ctx)
			continue
		}
		subCursor.Close(ctx)
		fmt.Printf("[DEBUG] Found %d subscribers for writer %s\n", len(subscribers), update.Writer.Hex())

		// Send email to each subscriber
		for _, sub := range subscribers {
			email := sub.SubscriberEmail
			fmt.Printf("[DEBUG] Sending email to: %s\n", email)
			isEmailSent := sendEmail(email, update.Title, update.Body)
			if !isEmailSent {
				log.Printf("[ERROR] Failure sending email to %s", email)
				continue
			}
			fmt.Printf("[DEBUG] Email sent to: %s\n", email)
		}

		// Mark update as sent
		fmt.Printf("[DEBUG] Marking update %s as sent...\n", update.ID.Hex())
		_, err = updateCollection.UpdateByID(ctx, update.ID, bson.M{"$set": bson.M{"sent": true}})
		if err != nil {
			log.Printf("[ERROR] Error updating sent field to true: %v", err)
			continue
		}
		fmt.Printf("[DEBUG] Update %s marked as sent.\n", update.ID.Hex())
	}

	if !found {
		fmt.Println("[DEBUG] No unsent updates found.")
	}
}

func sendEmail(email string, subject string, content string) bool {
	client := resend.NewClient(resend_apiKey)

	params := &resend.SendEmailRequest{
		From:    "bachman@bachmanfunded.xyz",
		To:      []string{email},
		Html:    content,
		Subject: subject,
		// Cc, Bcc, ReplyTo can be added if needed
	}

	fmt.Printf("[DEBUG] Calling Resend API for %s...\n", email)
	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("[ERROR] Resend API error for %s: %v\n", email, err)
		return false
	}
	fmt.Printf("[DEBUG] Resend API call successful for %s\n", email)
	return true
}
