package main

import (
	"github.com/ndphu/rpi-filemanager-golang/handler"
	"github.com/ndphu/rpi-filemanager-golang/model"
	"gopkg.in/gin-gonic/gin.v1"
	"log"
	"os"
)

var (
	AppContext *model.AppContext = nil
)

func main() {
	AppContext = &model.AppContext{
		ContextPath: "fm",
		RootDir:     "C:/",
	}
	log.Println("Updates")
	f, err := os.OpenFile("app.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()
	log.SetOutput(f)
	log.Println("Starting application...")

	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"hello": "world"})
	})
	handler.V1(r, AppContext)

	r.Run("0.0.0.0:80")
}
