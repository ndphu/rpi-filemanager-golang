import React,{Component} from 'react'
import { RouteHandler, browserHistory } from 'react-router'
import RaisedButton from 'material-ui/RaisedButton'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import Avatar from 'material-ui/Avatar'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileFileDownload from 'material-ui/svg-icons/file/file-download'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import ActionInfo from 'material-ui/svg-icons/action/info'
import ActionHome from 'material-ui/svg-icons/action/home'
import {blue700, yellow800, grey400 } from 'material-ui/styles/colors'
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart'
import IconButton from 'material-ui/IconButton';
import CircularProgress from 'material-ui/CircularProgress';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'


let menuItems = [
  { route: '/', text: 'Home' },
  { route: 'about', text: 'About' },
  { route: 'contact', text: 'Contact' },
];

export default class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			open: false,
			path: "",
			files: [],
			showUpload: false,
			selectedFiles: []
		}
	}

	componentDidMount() {
		this.fetchData(this.state.path)
	}

	fetchData(path) {
		this.setState({
			loading: true
		})
		fetch("/fm/v1/files?path=" + path)
		.then(response => response.json())
		.then(json => {

			if (json.err != undefined) {
				alert("Error: " + json.err)
			} else {
				this.setState({
					files: json,
					path: path,
					loading: false
				})
			}
		})
	}

	handleLeftIconClick(e) {		 
		this.fetchData(this.state.path.slice(0, this.state.path.lastIndexOf("/")))
	}


	handleMenuItemClick(e) {
		this.closeDrawer()	
	}

	handleDownload(f) {
		//window.open("/fm/v1/download/" + this.state.path + "/" + f.name, "_blank").focus()
		var anchor = document.createElement('a')
		anchor.href = "/fm/v1/download/" + this.state.path + "/" + f.name, "_blank"
		anchor.target = '_blank'
		anchor.download = f.name
		anchor.click();
	}

	handleFileClick(f) {
		window.open("/fm/v1/download/" + this.state.path + "/" + f.name, "_blank").focus()
	}

	closeDrawer() {
		this.setState({
			open: false
		})
	}

	getDateString(unixTimestamp) {
		const isoString = new Date(unixTimestamp * 1000).toISOString()
		return isoString.slice(0, 10) + " at " + isoString.slice(11, 19)
	}

	getHumanReadableSize(bytes) {
	  if (bytes == 0) { return "0.00 B"; }
	  var e = Math.floor(Math.log(bytes) / Math.log(1024));
	  return (bytes/Math.pow(1024, e)).toFixed(2)+' '+' KMGTP'.charAt(e)+'B';
	}

	openFolder(f) {
		this.fetchData(this.state.path + "/" + f.name)
	}

	onAppBarUploadClick() {
		this.setState({
			showUpload: true
		})
	}

	_openFileDialog() {
		this.setState({
			selectedFiles:[]
		})
	  	document.getElementById("fileUpload").click()
	}

	onFileUploadChanged(e) {
		this.setState({
			selectedFiles: e.target.files
		})
	}

	handleUploadClick() {
		for (var i = 0; i < this.state.selectedFiles.length; ++i) {
			var f = this.state.selectedFiles[i]
			var data = new FormData()
			data.append('file', f)
			fetch('/fm/v1/upload?path='+this.state.path, {
				method: 'POST',
				body: data
			}).then(response => {
				return response.json()
			}).then(json => {
				if (json.err != undefined) {
					alert(json.err)
				}
			})

			break
		}
	}

	render() {

		var folders = []
		var files = []
		this.state.files.forEach((e,i,r)=>{
			if (e.isDir == true) {
				folders.push(e)
			} else {
				files.push(e)
			}
		})

		var folderItems = folders.map(f => {
			return (
				<ListItem key={"key-folder-item-" + f.name}
			        leftAvatar={<Avatar icon={<FileFolder />}  backgroundColor={yellow800}/>}			        
			        primaryText={f.name}
			        secondaryText={
			        	f.childCount == 0? "Empty" : (f.childCount + (f.childCount > 1 ? " items" : " item"))
			        }
			        onClick={(e)=>{this.openFolder(f)}}
			      />
		    )		    
		})

		var selectedFileItems = []
		for (var i = 0; i < this.state.selectedFiles.length; ++i) {
			selectedFileItems.push(
			<ListItem key={"key-file-upload-" + this.state.selectedFiles[i].name}
				leftAvatar={<Avatar icon={<EditorInsertDriveFile />}/>}
				primaryText={this.state.selectedFiles[i].name}
				secondaryText={this.getHumanReadableSize(this.state.selectedFiles[i].size)}/>
			)
		}

		var fileItems = files.map(f=>{
			return (
				<ListItem key={"key-file-item-" + f.name}
			        leftAvatar={<Avatar icon={<EditorInsertDriveFile />}/>}
			        rightIconButton={(
			        	<IconMenu iconButtonElement={(
			        			<IconButton touch={true}>
								    <MoreVertIcon color={grey400} />
								</IconButton>
			        		)}>
						    <MenuItem onClick={(e)=>this.handleDownload(f)}>Download</MenuItem>
						    <MenuItem onClick={(e)=>this.handleRename(f)}>Rename</MenuItem>
						    <MenuItem onClick={(e)=>this.handleCopy(f)}>Copy</MenuItem>
						    <MenuItem onClick={(e)=>this.handleMove(f)}>Move</MenuItem>
						    <MenuItem onClick={(e)=>this.handleDelete(f)}>Delete</MenuItem>
						</IconMenu>
			        	)}
			        primaryText={f.name}
			        secondaryText={this.getHumanReadableSize(f.size) + " - " + this.getDateString(f.unixTimestamp)}

			      />
		    )
		})
		return (
			<div>
				<AppBar title={this.state.path == "" ? "Home" : this.state.path}
					    iconElementLeft={this.state.path=="" ? (
					    	<IconButton><ActionHome /></IconButton>
				    	) : (
					    	<IconButton><NavigationArrowBack /></IconButton>
					    )}
					    onLeftIconButtonTouchTap={(e)=> this.handleLeftIconClick(e)}
					    iconElementRight={<FlatButton onClick={(e)=>this.onAppBarUploadClick()} label="Upload" />}/>

				{this.state.loading == true ? (
					<CircularProgress />
					) : (
					<div>
						{folderItems.length != 0 ? (
							<div>
								<List>
							      <Subheader inset={true}>Folders</Subheader>
							      {folderItems}
							    </List>
							    <Divider inset={true} />
							 </div>
						):(<div></div>)}
						
					    {fileItems.length != 0 ? (
						    <List>
						      <Subheader inset={true}>Files</Subheader>
						    	{fileItems}
						    </List>
						) : (
							<div></div>
						)}
					</div>
					)}
				<Dialog
		          title={"Upload to " + (this.state.path == "" ? "/" : this.state.path)}
		          actions={[
				      <FlatButton
				        label="Cancel"
				        primary={true}
				        onTouchTap={(e)=>{this.setState({showUpload: false})}}
				      />,
				      <RaisedButton
				        label="Upload"
				        primary={true}
				        onTouchTap={(e)=>{this.handleUploadClick()}}				        
				      />,
				    ]}
		          modal={true}
		          contentStyle={{
					  width: '80%',
					  maxWidth: 'none',
					}}
		          open={this.state.showUpload}
		        >
		        	{this.state.selectedFiles.length == 0 ? (<p>Nothing to upload</p>):(
	        			<List style={{maxHeight: "300px",overflow:"scroll"}}>{selectedFileItems}</List>
	        		)}
		        	<RaisedButton
		        		primary={true}
						label="Add File"
						onClick={(e)=>this._openFileDialog()}/>
				  <input
				      ref="fileUpload"
				      type="file"
				      id="fileUpload"
				      style={{display:"none"}}
				      onChange={(e)=>this.onFileUploadChanged(e)} multiple/>
		        </Dialog>
			</div>
		)
	}
}