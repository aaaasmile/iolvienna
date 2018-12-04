package idl

var (
	Appname = "iol-service"
	Buildnr = "0.4.041218"
)

type IolPost struct {
	UserName string
	Date     string
	Content  string
}

type IolPostResp struct {
	Posts []IolPost
}

type IolUser struct {
	UserName string
	NumMsg   int
}

type IolUserResp struct {
	Users []IolUser
	Page  int
}
