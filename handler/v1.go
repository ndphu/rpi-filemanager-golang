package handler

import (
	"github.com/ndphu/rpi-filemanager-golang/model"
	"gopkg.in/gin-gonic/gin.v1"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"runtime"
)

func GetChildCount(path string) int {
	children, err := ioutil.ReadDir(path)
	if err != nil {
		return 0
	} else {
		return len(children)
	}
}

func V1(r *gin.Engine, appContext *model.AppContext) error {
	r.Static(appContext.ContextPath+"/v1/download", appContext.RootDir)
	r.GET(appContext.ContextPath+"/v1/files", func(c *gin.Context) {
		p := c.Query("path")
		currentDir := path.Join(appContext.RootDir, p)
		log.Printf("List file in %s\n", currentDir)
		fileInfos, err := ioutil.ReadDir(currentDir)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		} else {
			fileItems := make([]model.FileItem, len(fileInfos))
			for i, e := range fileInfos {
				fileItems[i] = model.FileItem{
					Name:          e.Name(),
					Size:          e.Size(),
					IsDir:         e.IsDir(),
					ModTime:       e.ModTime(),
					UnixTimestamp: e.ModTime().Unix(),
					AbsPath:       path.Join(p, e.Name()),
				}
				if e.IsDir() {
					fileItems[i].ChildCount = GetChildCount(path.Join(currentDir, e.Name()))
				} else {
					fileItems[i].ChildCount = 0
				}
			}
			c.JSON(200, fileItems)
		}
	})

	r.POST(appContext.ContextPath+"/v1/upload", func(c *gin.Context) {
		uploadPath := c.Query("path")
		file, header, err := c.Request.FormFile("file")
		filename := header.Filename
		os.Mkdir("./tmp", 644)
		tmpFile := "./tmp/" + filename
		out, err := os.Create(tmpFile)
		defer out.Close()
		if err != nil {
			log.Printf(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		} else {
			_, err = io.Copy(out, file)
			if err != nil {
				log.Printf(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
			} else {
				// Closing the file before moving
				out.Close()
				// move to the original directory
				realFile := path.Join(appContext.RootDir, uploadPath, filename)
				if runtime.GOOS == "windows" {
					err = doWindowsCopy(tmpFile, realFile)
				} else {
					err = os.Rename(tmpFile, realFile)
				}
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
				} else {
					c.JSON(http.StatusOK, gin.H{"file": realFile})
				}

			}
		}

	})

	return nil
}

func doWindowsCopy(src, dst string) (err error) {
	in, err := os.Open(src)
	if err != nil {
		return
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return
	}
	defer func() {
		cerr := out.Close()
		if err == nil {
			err = cerr
		}
	}()
	if _, err = io.Copy(out, in); err != nil {
		return
	}
	err = out.Sync()
	return
}
