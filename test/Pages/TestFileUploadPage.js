import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { FileAccess } from "../../core/FileAccess";
import { Alert } from "../../core/simple_confirm";
import { DOM } from "../../core/DOM";
import { Forms } from "../../components/Forms";

export class TestFileUploadPage extends HeaderPage {
	constructor(){
		super();

		this.fileField = "";

		this.fileFieldFileData = null;
		this.formData = {};
		this.form = new Forms([
			{ type:"file", name: "file1", title: "Select File", validateRule:"required|max:500|min:50|mimes:jpg,jpeg,png,pdf,doc,docx" },
		], this.formData)
	}

	get template(){
		return this.extendTemplate(super.template, template);
	}

	fileFieldChanged(evt){
		//console.log(this.fileField);

		if (!FileAccess.isSupported){
			Alert("File upload is not supported!");
			return;
		}

		/** @type {HTMLInputElement} */
		var fileFiled = evt.target
		var file = fileFiled.files[0];
		FileAccess.ReadFile(fileFiled.files[0]).DataURL().then( ret =>{
			//console.log(ret);
			if (file.type.indexOf("image/")==0) {
				this.fileFieldImage = ret;
			}
			this.fileFieldFileData = ret;
		}).catch(err=>{
			console.log(err);
		});
	}
	fileFieldUploadClicked(){
		var data = {
			field1:"value1",
			field2:"value2",
			field3:"value3",
			field4:"value4",


		}// new FormData();

		var formData =  new FormData();
		formData.append("data", JSON.stringify(data));
		formData.append("fileFieldFileData", this.fileFieldFileData);
		//formData.append('fileFieldFileData', this.fileFieldFileData);

		$.ajax(
			"http://mg.zero-divide.net/api/dump/",
			{
				method: "POST",
				data: formData,
				//contentType: "application/json",
				dataType:"json",
				processData: false
			})
		.done(data=>{
			if (data.success) {
				alert('Your file was successfully uploaded!');
			} else {
				alert('There was an error uploading your file!');
			}
		}).fail(err=>{
			console.log(err)
		})
	}
	formUploadClicked(){
		var data = this.formData;



		var formData =  new FormData();
		formData.append("data", JSON.stringify(data));
		formData.append("fileFieldFileData", this.fileFieldFileData);
		//formData.append('fileFieldFileData', this.fileFieldFileData);

		window.fetch("http://mg.zero-divide.net/api/dump/",
		{
			method: "POST",
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			redirect: 'follow',
    		headers:new Headers([
				['Content-Type', 'application/json']
			]),
			body: JSON.stringify(data)
		}).then(ret=>{
			console.log(ret)
			if (ret.status == 200) {
				alert('Your file was successfully uploaded!');
			} else {
				alert('There was an error uploading your file!');
			}
		});
		// $.ajax(
		// 	"http://mg.zero-divide.net/api/dump/",
		// 	{
		// 		method: "POST",
		// 		data: JSON.stringify(data),
		// 		//contentType: "application/json",
		// 		dataType:"json",
		// 		processData: false
		// 	})
		// .done(data=>{
		// 	if (data.success) {
		// 		alert('Your file was successfully uploaded!');
		// 	} else {
		// 		alert('There was an error uploading your file!');
		// 	}
		// }).fail(err=>{
		// 	console.log(err)
		// })
	}
}

var template = `
<div class="fill scroll">
	<h3>Plain File Field</h3>
	<div class = "fieldgroup">
		<img [src] = "this.fileFieldImage" width ="100px"/>
		<input type="file" name = "fileField" bind="this.fileField" onchange="this.fileFieldChanged($event)"/>
	</div>
	<div class = "fieldgroup">
		<button type="button" onclick = "this.fileFieldUploadClicked()">Upload!</button>
	</div>

	<h3>Forms File Field</h3>
	<div [component]="this.form"></div>
	<div class = "fieldgroup">
		<button type="button" onclick = "this.formUploadClicked()">Upload!</button>
	</div>
	<button onclick="this.form.validator.validate()">Validate</button
</div>	
`;