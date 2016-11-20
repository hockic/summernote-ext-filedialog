(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {
    var FileDialog = function (context) {
        var self = this;
        var ui = $.summernote.ui;

        var $editor = context.layoutInfo.editor;
        var options = context.options;
        var lang = options.langInfo;
        var callbacks = options.callbacks;

        // add hello button
        context.memo('button.file', function () {
            // create button
            var button = ui.button({
                contents: '<i class="fa fa-file"/>',
                tooltip: lang.file.insert,
                click: context.createInvokeHandler('fileDialog.show')
            });

            // create jQuery object from button instance.
            var $btn = button.render();
            return $btn;
        });

        // You can create elements for plugin
        this.initialize = function () {
            var $container = options.dialogsInBody ? $(document.body) : $editor;

            var body = '<div class="form-group note-group-select-from-files">' +
                '<label>' + lang.file.selectFromFiles + '</label>' +
                '<input class="note-file-input form-control" type="file" name="files" multiple="multiple" />' +
                '</div>' +
                '<div class="form-group" style="overflow:auto;">' +
                '<label>' + lang.file.text + '</label>' +
                '<input class="note-file-text form-control col-md-12" type="text" />' +
                '</div>';
            var footer = '<button href="#" class="btn btn-primary note-file-btn">' + lang.file.insert + '</button>';

            this.$dialog = ui.dialog({
                title: lang.file.insert,
                fade: options.dialogsFade,
                body: body,
                footer: footer
            }).render().appendTo($container);
        };

        this.show = function () {
            context.invoke('editor.saveRange');
            this.showFileDialog().then(function (files, text) {
                // [workaround] hide dialog before restore range for IE range focus
                ui.hideDialog(self.$dialog);
                context.invoke('editor.restoreRange');

                if (callbacks.onFileUpload) {
                    console.log(files);
                    context.triggerEvent('file.upload', files, text);
                } else {
                    console.log('onFileUpload not defined');
                }
            }).fail(function () {
                context.invoke('editor.restoreRange');
            });
        };

        /**
         * Show file dialog
         */
        this.showFileDialog = function () {
            return $.Deferred(function (deferred) {
                var $fileInput = self.$dialog.find('.note-file-input'),
                    $fileText = self.$dialog.find('.note-file-text'),
                    $fileBtn = self.$dialog.find('.note-file-btn');

                ui.onDialogShown(self.$dialog, function () {
                    $fileBtn.click(function (event) {
                        event.preventDefault();
                        deferred.resolve($fileInput.prop('files') || $fileInput.prop('value'), $fileText.val());
                    });
                });

                ui.onDialogHidden(self.$dialog, function () {
                    $fileBtn.off('click');

                    // Cloning $fileInput to clear element.
                    $fileInput.replaceWith($fileInput.clone().val(''));
                    $fileText.replaceWith($fileText.clone().val(''));

                    if (deferred.state() === 'pending') {
                        deferred.reject();
                    }
                });

                ui.showDialog(self.$dialog);
            });
        };

        /**
         * Called when editor is destroyed by $('..').summernote('destroy');
         */
        this.destroy = function () {
            this.$dialog.remove();
            this.$dialog = null;
        };
    }

    // Extend summernote
    $.extend(true, $.summernote, {
        plugins: {
            fileDialog: FileDialog
        },

        // add localization texts
        lang: {
            'en-US': {
                file: {
                    file: 'File',
                    text: 'Link Text',
                    insert: 'Insert File',
                    selectFromFiles: 'Select from files'
                }
            }
        },

        options: {
            callbacks: {
                onFileUpload: null
            }
        }
    });
}));