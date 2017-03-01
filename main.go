package main

import (
	"github.com/ndphu/rpi-filemanager-golang/handler"
	"github.com/ndphu/rpi-filemanager-golang/model"
	"gopkg.in/gin-gonic/gin.v1"
	"log"
	"net/http"
	"os"
)

var (
	AppContext *model.AppContext = nil
)

func main() {
	f, err := os.OpenFile("app.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()
	log.SetOutput(f)
	log.Println("Starting application...")

	RootDir := os.Getenv("FM_ROOT_DIR")
	if len(RootDir) == 0 {
		log.Println("FM_ROOT_DIR is not set, using /home/pi/fm")
		RootDir = "/home/pi/fm"
	}
	if stat, err := os.Stat(RootDir); os.IsNotExist(err) {
		err = os.Mkdir(RootDir, 644)
		if err != nil {
			log.Fatal("Cannot create root dir", err)
		}
	} else {
		log.Println(stat.Name())
	}

	AppContext = &model.AppContext{
		ContextPath: "fm",
		RootDir:     RootDir,
	}

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/fm/browse")
	})
	r.Static("/fm/js", "./ui/dist/fm/js")
	r.NoRoute(func(c *gin.Context) {
		c.File("./ui/dist/index.html")
	})
	handler.V1(r, AppContext)
	port := os.Getenv("FM_PORT")
	if len(port) == 0 {
		port = "8085"
	}
	r.Run(":" + port)
}
