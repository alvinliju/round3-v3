package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"

	"github.com/resend/resend-go/v2"

	//remove this thing on prod
	"github.com/gin-contrib/cors"
)

type Writer struct {
	ID      primitive.ObjectID `bson:"_id, omitempty"`
	Name    string             `bson:"name"`
	Email   string             `bson:"email"`
	Website string             `bson:"website"`
}

type Update struct {
	ID        primitive.ObjectID `bson:"_id, omitempty"`
	Writer    primitive.ObjectID `bson:"writer_id"`
	Title     string             `bson:"title"`
	Body      string             `bson:"body"`
	Sent      bool               `bson:"sent"`
	CreatedAt time.Time          `bson:"created_at"`
}

type Invite struct {
	ID             primitive.ObjectID `bson:"_id, omitempty"`
	VerificationID string             `bson:"verification_id"`
	Email          string             `bson:"email"`
	CreatedAt      time.Time          `bson:"created_at"`
}

type Subscription struct {
	ID             primitive.ObjectID `bson:"_id, omitempty"`
	WriterID       primitive.ObjectID `bson:"writer_id"`
	SubsciberEmail string             `bson:"subscriber_email"`
}

type InviteRequest struct {
	Email string `bson:"Email"`
}

type AuthToken struct {
	Email     string
	CreatedAt time.Time
}

// creating a map, i am not using map just coz of using sake
// i am using map because thats what works i can do something like
// if db looks like name and gmail "Alvin" -> "alvin@gmail.com" we can do like this
// doing this an array is possible to but too much work

var resend_apiKey string
var MONGO_URI string
var jwt_key []byte

// db integration
var mongoClient *mongo.Client
var db *mongo.Database

// Remove these from package level
var (
	writerCollection        *mongo.Collection
	updateCollection        *mongo.Collection
	inviteCollection        *mongo.Collection
	authCollection          *mongo.Collection
	subscriptionsCollection *mongo.Collection
)

func initMongo() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(MONGO_URI))
	if err != nil {
		log.Fatal(err)
	}
	mongoClient = client
	db = client.Database("BachmanFunded")

	writerCollection = db.Collection("writers")
	updateCollection = db.Collection("updates")
	inviteCollection = db.Collection("invites")
	authCollection = db.Collection("auth_tokens")
	subscriptionsCollection = db.Collection("subscriptions")
}

// okay now great we have init mongo but what next?
// mongo is document based so create diffrent documents to store shit in the db
// basically i am thinking of what kind of people/function does the app servr and make collections accordingly in postgres terms its like tables
// we want few docs -> writers, updates, invites, auth_tokens, subscriptions(list of subscribers emails linked w writers email)

func main() {

	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}

	//.env file init if not in prd
	if env != "production" {
		godotenv.Load() // Just ignore the error in production
	}

	MONGO_URI = os.Getenv("MONGO_URI")

	initMongo()

	var router *gin.Engine = gin.Default()

	resend_apiKey = os.Getenv("RESEND_API_KEY")
	jwt_key = []byte(os.Getenv("JWT_KEY"))

	//CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "https://www.round3.xyz", "https://bachmanfunded.xyz", "https://www.bachmanfunded.xyz"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	//auth
	router.POST("/login/request", writerLoginRequest)
	router.POST("/login/verify", writerLoginVerify)

	//user routes
	router.GET("/", fuckit)
	router.POST("/invite-writer", inviteWriter)
	router.POST("/accept-invite", acceptInvite)
	router.GET("/writers", discoverWriters)
	router.POST("/post-update", AuthMiddleware(), postUpdate)
	router.POST("/subscribe", subscribeToWriter)

	router.Run(":8080")

}

// funnhey hello world handler
func fuckit(context *gin.Context) {
	context.IndentedJSON(http.StatusOK, gin.H{"message": "Hello world"})
}

func inviteWriter(context *gin.Context) {

	var req InviteRequest

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	email := req.Email

	isValid := validEmail(email)

	if !isValid {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Enter a valid email"})
		return
	}

	//check if writer is already invited

	var existingInvite Invite
	err := inviteCollection.FindOne(context, bson.M{"email": email}).Decode(&existingInvite)
	if err == nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invite already exists"})
		return
	}

	//check if writer already exists

	var existingWriter Writer
	err = writerCollection.FindOne(context, bson.M{"email": email}).Decode(&existingWriter)
	if err == nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Writer already exists"})
		return
	}

	//create a new invite
	randomVerificationID := uuid.New().String()
	currTime := time.Now()

	url := "http:///accept-request?id=" + randomVerificationID

	//send email
	//emailSent := sendEmail(email, url)

	emailSent := sendEmail(email, "Invite Request From BachmanFunded", url)

	if !emailSent {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not send email"})
		return
	}

	_, err = inviteCollection.InsertOne(context, bson.M{
		"email":           email,
		"verification_id": randomVerificationID,
		"created_at":      currTime,
	})

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong try again"})
		return
	}

	context.JSON(http.StatusAccepted, gin.H{"message": "Email send, wait for the writer to accept the request"})

}

// helper function for inviteWriter
func sendEmail(email string, subject string, content string) bool {
	client := resend.NewClient(resend_apiKey)

	params := &resend.SendEmailRequest{
		From:    "bachman@bachmanfunded.xyz",
		To:      []string{email},
		Html:    content,
		Subject: subject,
		Cc:      []string{"cc@example.com"},
		Bcc:     []string{"bcc@example.com"},
		ReplyTo: "replyto@example.com",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		fmt.Println(err)
		return false
	}

	_ = sent

	return true
}

func acceptInvite(context *gin.Context) {

	var req struct {
		VerificationID string `json:"ID"`
		Email          string `json:"Email"`
		Name           string `json:"Name"`
		Website        string `json:"Website"`
	}

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}
	// var found bool = false
	// for xmail, xuuid := range mailStore {
	// 	if xmail == email {
	// 		found = true
	// 		if xuuid == id {
	// 			acceptedWriters[email] = Writer{
	// 				ID:      id,
	// 				Name:    name,
	// 				Email:   xmail,
	// 				Website: website,
	// 			}
	// 			sendEmail(email, "kiti")
	// 			context.JSON(http.StatusOK, gin.H{"message": "Accepted"})
	// 			return
	// 		} else {
	// 			context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Id"})
	// 			return
	// 		}

	// 	}

	// }

	// if !found {
	// 	context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Email"})
	// 	return
	// }
	//
	//validate acceptInvite
	var invite Invite
	err := inviteCollection.FindOne(context, bson.M{"email": req.Email, "verification_id": req.VerificationID}).Decode(&invite)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Invite"})
		return
	}

	writer := Writer{
		ID:      primitive.NewObjectID(),
		Name:    req.Name,
		Email:   req.Email,
		Website: req.Website,
	}

	_, err = writerCollection.InsertOne(context, writer)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not create writer, try again later"})
		return
	}

	inviteCollection.DeleteOne(context, bson.M{"_id": invite.ID})
	sendEmail(req.Email, "Welcome to BachmanFunded", "you've succesfully signedup for BachmanFunded")
	context.JSON(http.StatusCreated, gin.H{"message": "Writer created succesfully"})
}

// helper email validator
func validEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// post updates handler
func postUpdate(context *gin.Context) {
	var req struct {
		Title string `json:"Title"`
		Body  string `json:"Body"`
	}
	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	email := context.GetString("email")

	//find writer
	var writer Writer
	err := writerCollection.FindOne(context, bson.M{"email": email}).Decode(&writer)
	if err != nil {
		context.JSON(http.StatusNotFound, gin.H{"message": "Writer not found"})
		return
	}

	// writer, ok := acceptedWriters[email]
	// if !ok {
	// 	context.JSON(http.StatusBadRequest, gin.H{"message": "Writer not found"})
	// 	return
	// }

	currentTime := time.Now()
	update := Update{
		ID:        primitive.NewObjectID(),
		Writer:    writer.ID,
		Title:     req.Title,
		Body:      req.Body,
		Sent:      false,
		CreatedAt: currentTime,
	}

	_, err = updateCollection.InsertOne(context, update)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not post the update"})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Update Posted",
		"update": update,
	})
}

func discoverWriters(context *gin.Context) {

	cursor, err := writerCollection.Find(context, bson.M{})
	if err != nil {
		log.Printf("Failed to fetch writers: %v", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch writers"})
		return
	}

	defer cursor.Close(context)

	var writersList []Writer
	if err = cursor.All(context, &writersList); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to decode writers"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Fetch Success", "writers": writersList})
}

func subscribeToWriter(context *gin.Context) {
	var req struct {
		WriterEmail     string `json:"WriterEmail"`
		SubscriberEmail string `json:"SubscriberEmail"`
	}

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	//find writer
	var writer Writer
	err := writerCollection.FindOne(context, bson.M{"email": req.WriterEmail}).Decode(&writer)
	if err != nil {
		context.JSON(http.StatusNotFound, gin.H{"message": "Writer not found"})
		return
	}

	//see if user is already subscribed
	var exisingSubscriber Subscription
	err = subscriptionsCollection.FindOne(context, bson.M{"writer_id": writer.ID, "subscriber_email": req.SubscriberEmail}).Decode(&exisingSubscriber)
	if err == nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Already subscribed, kindly wait for any updated from the writer"})
		return
	}

	//add subscriber email to the doc
	_, err = subscriptionsCollection.InsertOne(context, bson.M{
		"writer_id":        writer.ID,
		"subscriber_email": req.SubscriberEmail,
	})

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create subscription"})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Subscription Added"})
	return

}

func writerLoginRequest(context *gin.Context) {
	var req struct {
		WriterEmail string `json:"WriterEmail"`
	}

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	//here is how the flow wroks
	//writer submits the email
	//check on our db if he exists
	var writer Writer
	err := writerCollection.FindOne(context, bson.M{"email": req.WriterEmail}).Decode(&writer)
	if err != nil {
		context.JSON(http.StatusNotFound, gin.H{"message": "Writer not found"})
		return
	}

	//if he does exist create an uuid "sfa234240-agaf"
	token := uuid.New().String()

	_, err = authCollection.InsertOne(context, bson.M{
		"token":      token,
		"email":      req.WriterEmail,
		"created_at": time.Now(),
	})
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create auth token"})
		return
	}
	//send the uuid to the writer's email
	url := "http://localhost:5173/login/verify?token=" + token

	isEmailSent := sendEmail(req.WriterEmail, "BachmanFunded verification link", url)

	if !isEmailSent {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not send email"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Email send"})
	//when the user clicks the link it'll verify and give him a jwt
}

func writerLoginVerify(context *gin.Context) {
	var req struct {
		Token string `json:"Token"`
	}

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	//see if the provided token exists in the sore
	var authToken struct {
		Email     string    `bson:"email"`
		CreatedAt time.Time `bson:"created_at"`
	}

	err := authCollection.FindOne(context, bson.M{"token": req.Token}).Decode(&authToken)

	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Token"})
		return
	}

	if time.Since(authToken.CreatedAt) > 15*time.Minute {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Token Expired"})
		return
	}

	//till now we verified token so now either we provide a jwt and check add a middleware for post route or implement a session handling mechanism
	//i'll go with jwt less overhead and clean

	claims := jwt.MapClaims{
		"email": authToken.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}

	jwt_token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := jwt_token.SignedString(jwt_key)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not create JWT"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"Token": signedToken})
}

// auth middleware
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Example: get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Missing Authorization header"})
			return
		}
		// Remove "Bearer " prefix
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Check the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			// Optionally, check for a specific algorithm (like "HS256")
			if token.Method.Alg() != "HS256" {
				return nil, fmt.Errorf("unexpected signing algorithm: %v", token.Method.Alg())
			}
			return jwt_key, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Invalid or expired token"})
			return
		}

		// (Optional) Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if email, ok := claims["email"].(string); ok {
				c.Set("email", email)
			}
		}

		c.Next()
	}
}
