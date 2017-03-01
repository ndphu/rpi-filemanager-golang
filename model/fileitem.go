package model

import (
	"time"
)

type FileItem struct {
	Name          string    `json:"name"`
	IsDir         bool      `json:"isDir"`
	Size          int64     `json:"size"`
	ModTime       time.Time `json:"modTime"`
	UnixTimestamp int64     `json:"unixTimestamp"`
	ChildCount    int       `json:"childCount"`
	AbsPath       string    `json:"absPath"`
}
