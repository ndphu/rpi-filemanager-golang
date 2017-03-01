import React,{Component} from 'react'
import { RouteHandler, browserHistory, Link } from 'react-router'
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
import ActionBackup from 'material-ui/svg-icons/action/backup'
import ActionInfo from 'material-ui/svg-icons/action/info'
import ActionHome from 'material-ui/svg-icons/action/home'
import {blue700, yellow800, grey400,darkBlack } from 'material-ui/styles/colors'
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart'
import IconButton from 'material-ui/IconButton';
import CircularProgress from 'material-ui/CircularProgress';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import UploadDialog from './UploadDialog'


let menuItems = [
  { route: '/', text: 'Home' },
  { route: 'about', text: 'About' },
  { route: 'contact', text: 'Contact' },
];

export default class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			files: [],
			showUpload: false,
			selectedFiles: [],
			headerNavigationItems : []
		}
	}

	componentDidMount() {
		this.parseHeaderNavigationItems(this.getCurrentPath())
		this.fetchData(this.getCurrentPath())
	}

	parseHeaderNavigationItems(path) {
		var pathParts = path.split("/")
		var pathItemsData = []
		for (var i = 0; i < pathParts.length; ++i) {
			var p = ""
			for (var j = 0; j <= i; ++j) {
				p += pathParts[j]
				if (i != j) {
					p += "/"
				}
			}
			var targetLink = "/fm/browse?path=" + p			
			pathItemsData.push({
				label: pathParts[i],
				link: targetLink
				})			
		}
		this.setState({
			headerNavigationItems: pathItemsData
		})
	}

	componentWillReceiveProps(nextProps) {		
		this.parseHeaderNavigationItems(nextProps.location.query["path"] != undefined ? nextProps.location.query["path"] : "")
		this.fetchData(nextProps.location.query["path"] == undefined ? "" : nextProps.location.query["path"])
	}

	fetchData(path) {
		this.setState({
			loading: true,
			showUpload: false
		})
		fetch("/fm/v1/files?path=" + path).then(response => response.json()).then(json => {
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
		//this.fetchData(this.state.path.slice(0, this.state.path.lastIndexOf("/")))
		browserHistory.push("/fm/browse?path=")
	}


	handleMenuItemClick(e) {
		this.closeDrawer()	
	}

	handleDownload(f) {
		//window.open("/fm/v1/download/" + this.state.path + "/" + f.name, "_blank").focus()
		var anchor = document.createElement('a')
		anchor.href = "/fm/v1/download/" + this.getCurrentPath() + "/" + f.name, "_blank"
		anchor.target = '_blank'
		anchor.download = f.name
		anchor.click();
	}

	handleFileClick(f) {		
		window.open("/fm/v1/download/" + this.getCurrentPath() + "/" + f.name, "_blank").focus()
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

	getCurrentPath() {
		return this.props.location.query["path"] == undefined ? "" : this.props.location.query["path"]
	}

	openFolder(f) {
		//this.fetchData(this.state.path + "/" + f.name)		
		browserHistory.push("/fm/browse?path=" + f.absPath)
	}

	onAppBarUploadClick() {
		this.setState({
			showUpload: true
		})
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
			        	<p>
			        		{f.childCount == 0? "Empty" : (f.childCount + (f.childCount > 1 ? " items" : " item"))}<br />
			        		Last modified {this.getDateString(f.unixTimestamp)}
			        	</p>
			        }
			        secondaryTextLines={2}
			        onClick={(e)=>{this.openFolder(f)}}
			      />
		    )		    
		})

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
			        secondaryText={
			        	<p>			              			              
			        		{getHumanReadableSize(f.size)}<br/>
			              	Last modified {this.getDateString(f.unixTimestamp)}<br />			              
			            </p>
			        }
			        secondaryTextLines={2}
			        onTouchTap={()=>{this.handleFileClick(f)}}
			      />
		    )
		})
		var pathItems = this.state.headerNavigationItems.map(item => {
			return (
				<a style={{cursor:"pointer"}} onClick={()=>browserHistory.push(item.link)}  key={"key-header-navigation-" + item.link}>{item.label}/</a>
			)
		})		
		return (
			<div>
				<AppBar title={this.state.path == "" ? "Home" : (
						<span>{pathItems}</span>
					)}
					iconElementLeft={<IconButton><ActionHome /></IconButton>}
					onLeftIconButtonTouchTap={(e)=> this.handleLeftIconClick(e)}
					iconElementRight={<IconButton onClick={(e)=>this.onAppBarUploadClick()}><ActionBackup/></IconButton>}/>

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
				{this.state.showUpload == true ? (
					<UploadDialog open={this.state.showUpload} uploadPath={this.getCurrentPath()}/>
				) : (
					<div></div>
				)}
			</div>
		)
	}
}