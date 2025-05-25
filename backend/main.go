package main

import (
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"

	//remove this thing on prod
	"github.com/gin-contrib/cors"
)

type Writer struct {
	ID      string
	Name    string
	Email   string
	Website string
}

type Update struct {
	ID      string
	Writer  Writer //writers email
	Title   string
	Body    string
	Sent    bool
	Created string
}

type InviteRequest struct {
	Email string `json:"Email"`
}

type AuthToken struct {
	Email     string
	CreatedAt time.Time
}

// creating a map, i am not using map just coz of using sake
// i am using map because thats what works i can do something like
// if db looks like name and gmail "Alvin" -> "alvin@gmail.com" we can do like this
// doing this an array is possible to but too much work

var writers = []Writer{}

var mailStore = make(map[string]string)

var acceptedWriters = make(map[string]Writer)

var updates = []Update{}

var subscribers = map[string][]string{}

var authStore = make(map[string]AuthToken)

var resend_apiKey string
var jwt_key []byte

func main() {
	//.env file init
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")

	}

	var router *gin.Engine = gin.Default()

	resend_apiKey = os.Getenv("RESEND_API_KEY")
	jwt_key = []byte(os.Getenv("JWT_KEY"))

	//CORS
	router.Use(cors.Default())

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

	randomVerificationID := uuid.New().String()

	for xmail, _ := range mailStore {
		if xmail == email {
			fmt.Print(xmail)
			context.JSON(http.StatusBadRequest, gin.H{"message": "Request already sent wait for writer to accept the request."})
			return
		}
	}

	for fmail, _ := range acceptedWriters {
		if fmail == email {
			context.JSON(http.StatusBadRequest, gin.H{"message": "Writer already exists, subscribe to them to read their updates."})
			return
		}
	}

	mailStore[email] = randomVerificationID

	url := "localhost:5173/accept-request?id=" + randomVerificationID

	//send email
	emailSent := sendEmail(email, url)

	if !emailSent {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not send email"})
		return
	}

	context.JSON(http.StatusAccepted, gin.H{"message": "Email send, wait for the writer to accept the request"})

}

// helper function for inviteWriter
func sendEmail(email string, url string) bool {
	client := resend.NewClient(resend_apiKey)

	params := &resend.SendEmailRequest{
		From:    "Round3 <onboarding@resend.dev>",
		To:      []string{email},
		Html:    url,
		Subject: "Round3 Invite Request",
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
		ID      string `json:"ID"`
		Email   string `json:"Email"`
		Name    string `json:"Name"`
		Website string `json:"Website"`
	}

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	id := req.ID
	email := req.Email
	name := req.Name
	website := req.Website

	var found bool = false
	for xmail, xuuid := range mailStore {
		if xmail == email {
			found = true
			if xuuid == id {
				acceptedWriters[email] = Writer{
					ID:      id,
					Name:    name,
					Email:   xmail,
					Website: website,
				}
				sendEmail(email, "kiti")
				context.JSON(http.StatusOK, gin.H{"message": "Accepted"})
				return
			} else {
				context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Id"})
				return
			}

		}

	}

	if !found {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Email"})
		return
	}

	context.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong"})

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

	writer, ok := acceptedWriters[email]
	if !ok {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Writer not found"})
		return
	}

	currentTime := time.Now()
	update := Update{
		ID:      uuid.New().String(),
		Writer:  writer,
		Title:   req.Title,
		Body:    req.Body,
		Sent:    false,
		Created: fmt.Sprintf("%v", currentTime),
	}

	updates = append(updates, update)

	context.JSON(http.StatusCreated, gin.H{"message": "Update Posted",
		"update": update,
	})
}

func discoverWriters(context *gin.Context) {
	var writersList []Writer
	for _, w := range acceptedWriters {
		writersList = append(writersList, w)
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

	if _, ok := acceptedWriters[req.WriterEmail]; !ok {
		context.JSON(http.StatusNotFound, gin.H{"message": "Writer Not Found"})
		return
	}

	for _, sub := range subscribers[req.WriterEmail] {
		if sub == req.SubscriberEmail {
			context.JSON(http.StatusBadRequest, gin.H{"message": "Already subscribed wait for any updates from writer"})
			return
		}
	}

	subscribers[req.WriterEmail] = append(subscribers[req.WriterEmail], req.SubscriberEmail)

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
	if _, ok := acceptedWriters[req.WriterEmail]; !ok {
		context.JSON(http.StatusNotFound, gin.H{"message": "Writer not found"})
		return
	}

	//if he does exist create an uuid "sfa234240-agaf"
	token := uuid.New().String()

	authStore[token] = AuthToken{
		Email:     req.WriterEmail,
		CreatedAt: time.Now(),
	}
	//send the uuid to the writer's email
	url := "localhost:5173/login/verify?token=" + token

	isEmailSent := sendEmail(req.WriterEmail, url)

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

	tokenData, exists := authStore[req.Token]

	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Token"})
		return
	}

	if time.Since(tokenData.CreatedAt) > 15*time.Minute {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Token Expired"})
		return
	}

	//till now we verified token so now either we provide a jwt and check add a middleware for post route or implement a session handling mechanism
	//i'll go with jwt less overhead and clean

	claims := jwt.MapClaims{
		"email": tokenData.Email,
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
