import React, {Component} from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dropzone from 'react-dropzone'
import Avatar from 'material-ui/Avatar'
import {List, ListItem} from 'material-ui/List'
import {green200, grey400} from 'material-ui/styles/colors'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import ActionDone from 'material-ui/svg-icons/action/done'
import CircularProgress from 'material-ui/CircularProgress';

class UploadDialog extends Component {
	constructor(props) {
		super(props)
		this.state = {
			open: true,
			selectedFiles: []
		}
	}

	componentDidMount() {
		this.setState({
			open: this.props.open
		})
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			open: nextProps.open
		})
	}

	openFileDialog() {
		this.setState({
			selectedFiles:[]
		})
	  	document.getElementById("fileUpload").click()
	}

	// onFileUploadChanged(e) {
	// 	const selectedFiles = []
	// 	for (var i = 0; i < e.target.files.length; ++i) {
	// 		selectedFiles.push({
	// 			file: e.target.files[i],
	// 			uploaded : false
	// 		})
	// 	}
	// 	this.setState({
	// 		selectedFiles: selectedFiles
	// 	})
	// }

	doUpload(f) {
		var data = new FormData()
		data.append('file', f)
		fetch('/fm/v1/upload?path='+this.props.uploadPath, {
			method: 'POST',
			body: data
		}).then(response => {
			return response.json()
		}).then(json => {
			if (json.err != undefined) {
				alert(json.err)
			}
		})
	}

	handleUploadClick() {		
		this.state.selectedFiles.forEach((e,i) => {
			if (e.uploaded) {
				return
			}
			e.uploading = true
			this.setState(this.state)
			var data = new FormData()
			data.append('file', e.file)
			fetch('/fm/v1/upload?path='+this.props.uploadPath, {
				method: 'POST',
				body: data
			}).then(response => {
				return response.json()
			}).then(json => {
				if (json.err != undefined) {
					alert(json.err)
					e.uploaded = false
					e.err = json.err
					e.uploading = false
				} else {
					e.uploaded = true
					e.uploading = false
				}
				this.setState(this.state)
			})
		})
		
	}

	onDrop(files) {
		const selectedFiles = []
      	for (var i = 0; i < files.length; ++i) {
			selectedFiles.push({
				file: files[i],
				uploaded : false
			})
		}
		this.setState({
			selectedFiles: selectedFiles
		})
    }


	render() {
		var totalSize = 0
		var selectedFileItems = this.state.selectedFiles.map(i => {
			const f = i.file
			totalSize += f.size
			return (
				<ListItem key={"key-file-upload-" + f.name}
					leftAvatar={<Avatar icon={<EditorInsertDriveFile />}/>}
					primaryText={f.name}
					secondaryText={getHumanReadableSize(f.size) + (i.uploading ? " - Uploading " : "")}
					rightIcon={i.uploaded ? <ActionDone /> : (i.uploading ? <CircularProgress size={25} thickness={2.5} /> : <span/>)}
				/>
			)
				
		})
		return (
			<Dialog
		          title={"Upload to " + (this.props.uploadPath == "" ? "/" : this.props.uploadPath)}
		          actions={[
				      <FlatButton
				        label="Close"
				        primary={true}
				        onTouchTap={(e)=>{this.setState({open: false})}}
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
		          open={this.state.open}>
		          	{this.state.selectedFiles.length == 0 ? (<span/>):(
		          		<div>
	        				<List style={{maxHeight: "300px",overflow:"scroll",overflowX: "hidden"}}>{selectedFileItems}</List>
	        				<p>{this.state.selectedFiles.length + " file" + (this.state.selectedFiles.length > 1 ? "s" : "") + " - " + getHumanReadableSize(totalSize)}</p>
        				</div>)}
		        	<Dropzone style={{
		        		width: "100%",
		        		height: "20px",
		        		borderWidth: "1.5px",
		        		borderColor: grey400,
		        		borderStyle: "dashed",
		        		borderRadius: "3px",
		        		textAlign: "center",
		        		paddingTop: "16px",
		        		paddingBottom: "16px",
		        		"cursor": "pointer"
		        	}} onDrop={(e)=>{this.onDrop(e)}}>
		              <div>Try dropping some files here, or click to select files to upload.</div>
		            </Dropzone>		        	
		        </Dialog>
		)
	}
}
//
// {this.state.selectedFiles.length == 0 ? (<p>Nothing to upload</p>):(
		        	// 	<div>
	        		// 		<List style={{maxHeight: "300px",overflow:"scroll",overflowX: "hidden"}}>{selectedFileItems}</List>
	        		// 		<p>{this.state.selectedFiles.length + " file" + (this.state.selectedFiles.length > 1 ? "s" : "") + " - " + getHumanReadableSize(totalSize)}</p>
	        		// 	</div>
	        		// )}
// <RaisedButton
		    //     		primary={true}
						// label="Add File"
						// onClick={(e)=>this.openFileDialog()}/>
				  // <input
				  //     ref="fileUpload"
				  //     type="file"
				  //     id="fileUpload"
				  //     style={{display:"none"}}
				  //     onChange={(e)=>this.onFileUploadChanged(e)} multiple/>
//
export default UploadDialog