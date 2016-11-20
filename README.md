# summernote-ext-filedialog
Based on summernote's ImageDialog

## Setup
 * Include summernote project script
 * Include [Font Awesome](http://fontawesome.io/)
 * Include the script tag below in your document
```HTML
<script src="http://example.com/summernote-ext-filedialog.js"></script>
```

## Usage
```javascript
$('.summernote').summernote({
    toolbar:[
        ['insert', ['file']],
    ],
    callbacks: {
		onFileUpload: function(files, text) {
			var data = new FormData();
			var that = this;
			data.append("file", files[0]);

			$.ajax ({
				data: data,
				type: 'post',
				dataType: 'json',
				url: 'https://path.to/your/upload/process',
				cache: false,
				contentType: false,
				processData: false,
				success: function(response) {
					$(that).summernote('createLink', {
						text: text,
						url: response.url,
						newWindow: true
					});
				},
				error: function(response) {
					console.log(response);
				}
			});
		}
	}
});
```

## License
summernote-ext-filedialog may be freely distributed under the MIT license.