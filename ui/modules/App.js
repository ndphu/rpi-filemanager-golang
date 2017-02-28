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
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import ActionInfo from 'material-ui/svg-icons/action/info'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionAssignment from 'material-ui/svg-icons/action/assignment'
import {blue700, yellow900} from 'material-ui/styles/colors'
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart'
import IconButton from 'material-ui/IconButton';

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
			files: []
		}
	}

	componentDidMount() {
		this.fetchData()
	}

	fetchData() {
		fetch("/fm/v1/files?path=" + this.state.path)
		.then(response => response.json())
		.then(json => {
			if (json.err != undefined) {
				throw json.err
			}
			this.setState({
				files: json
			})
		}).catch(e => {
			throw e
		})
	}

	handleLeftIconClick(e) {
		this.state.path = this.state.path.slice(0, this.state.path.lastIndexOf("/")) 
		this.fetchData()
	}


	handleMenuItemClick(e) {
		this.closeDrawer()	
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
		const originPath = this.state.path
		this.state.path = this.state.path + "/" + f.name
		try {
			this.fetchData()
		} catch(e) {
			this.state.path = originPath
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
			        leftAvatar={<Avatar icon={<FileFolder />}  backgroundColor={yellow900}/>}
			        rightIcon={<ActionInfo />}
			        primaryText={f.name}
			        secondaryText={
			        	f.childCount == 0? "Empty" : (f.childCount + (f.childCount > 1 ? " items" : " item"))
			        }
			        onClick={(e)=>{this.openFolder(f)}}
			      />
		    )		    
		})

		var fileItems = files.map(f=>{
			return (
				<ListItem key={"key-file-item-" + f.name}
			        leftAvatar={<Avatar icon={<EditorInsertDriveFile />}/>}
			        rightIcon={<ActionInfo />}
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
					    onLeftIconButtonTouchTap={(e)=> this.handleLeftIconClick(e)}/>
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
		)
	}
}