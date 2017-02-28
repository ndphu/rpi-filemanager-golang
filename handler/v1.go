package handler

import (
	"github.com/ndphu/rpi-filemanager-golang/model"
	"gopkg.in/gin-gonic/gin.v1"
	"io/ioutil"
	"net/http"
	"path"
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

	return nil
}
