package main

import (
	"fmt"
	"log"
	"net/http"
	"net/mail"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"
)

type Writer struct {
	ID    string
	Name  string
	Email string
}

type InviteRequest struct {
	Email string `json:"Email"`
}

// creating a map, i am not using map just coz of using sake
// i am using map because thats what works i can do something like
// if db looks like name and gmail "Alvin" -> "alvin@gmail.com" we can do like this
// doing this an array is possible to but too much work

var writers = []Writer{}

var mailStore = make(map[string]string)

var apiKey = "re_dG2eKYEw_8tNTtVs5QM1ozDyyqYbd6T6x"

func main() {
	//.env file init
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	var router *gin.Engine = gin.Default()

	router.GET("/", fuckit)
	router.POST("/invite-writer", inviteWriter)
	router.POST("/accept-invite/:id", acceptInvite)

	router.Run(":8080")

}

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

	mailStore[email] = randomVerificationID

	url := "round3.xyz/accept-request?id=" + randomVerificationID

	//send email
	emailSent := sendEmail(email, url)

	if !emailSent {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not send any email"})
		return
	}

	context.JSON(http.StatusAccepted, gin.H{"message": "Email send, wait for the writer to accept the request"})

}

// helper function for inviteWriter
func sendEmail(email string, url string) bool {
	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    "Acme <onboarding@resend.dev>",
		To:      []string{email},
		Html:    url,
		Subject: "Round3 Invite Request",
		Cc:      []string{"cc@example.com"},
		Bcc:     []string{"bcc@example.com"},
		ReplyTo: "replyto@example.com",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		return false
	}

	_ = sent

	return true
}

func acceptInvite(context *gin.Context) {
	id := context.Param("id")

	var req InviteRequest

	if err := context.BindJSON(&req); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
		return
	}

	email := req.Email

	for xmail, xuuid := range mailStore {
		if xmail == email {
			if xuuid == id {
				context.JSON(http.StatusOK, gin.H{"message": "Accepted"})
				return
			}

			context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Id"})
			return
		}

		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Email"})
		return
	}

}

func validEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
