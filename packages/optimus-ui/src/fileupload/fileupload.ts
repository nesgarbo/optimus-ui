import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    input,
    NgModule,
    NgZone,
    numberAttribute,
    output,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation,
    contentChild,
    viewChild,
    contentChildren
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { addClass, removeClass } from '@openng/optimus-ui-utils';
import { BlockableUI, PrimeTemplate, SharedModule, TranslationKeys } from '@openng/optimus-ui/api';
import { Badge } from '@openng/optimus-ui/badge';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { Button, ButtonProps } from '@openng/optimus-ui/button';
import { PlusIcon, TimesIcon, UploadIcon } from '@openng/optimus-ui/icons';
import { Message } from '@openng/optimus-ui/message';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { VoidListener } from '@openng/optimus-ui/ts-helpers';
import type { BadgeSeverity } from '@openng/optimus-ui/types/badge';
import {
    FileBeforeUploadEvent,
    FileProgressEvent,
    FileRemoveEvent,
    FileSelectEvent,
    FileSendEvent,
    FileUploadContentTemplateContext,
    FileUploadErrorEvent,
    FileUploadEvent,
    FileUploadFileLabelTemplateContext,
    FileUploadHandlerEvent,
    FileUploadHeaderTemplateContext,
    FileUploadPassThrough,
    RemoveUploadedFileEvent
} from '@openng/optimus-ui/types/fileupload';
import { Subscription } from 'rxjs';
import { FileUploadStyle } from './style/fileuploadstyle';

const FILEUPLOAD_INSTANCE = new InjectionToken<FileUpload>('FILEUPLOAD_INSTANCE');

@Component({
    selector: '[pFileContent]',
    standalone: true,
    template: `@for (file of files(); track file?.name + '-' + $index; let index = $index) {
        <div [class]="cx('file')" [pBind]="$pcFileUpload.ptm('file')">
            <img role="presentation" [class]="cx('fileThumbnail')" [attr.alt]="file.name" [src]="file.objectURL" [width]="previewWidth()" [pBind]="$pcFileUpload.ptm('fileThumbnail')" />
            <div [class]="cx('fileInfo')" [pBind]="$pcFileUpload.ptm('fileInfo')">
                <div [class]="cx('fileName')" [pBind]="$pcFileUpload.ptm('fileName')">{{ file.name }}</div>
                <span [class]="cx('fileSize')" [pBind]="$pcFileUpload.ptm('fileSize')">{{ formatSize(file.size) }}</span>
            </div>
            <p-badge [value]="badgeValue()" [severity]="badgeSeverity()" [class]="cx('pcFileBadge')" [pt]="$pcFileUpload.ptm('pcFileBadge')" [unstyled]="unstyled()" />
            <div [class]="cx('fileActions')" [pBind]="$pcFileUpload.ptm('fileActions')">
                <p-button (onClick)="onRemoveClick($event, index)" [styleClass]="cx('pcFileRemoveButton')" text rounded severity="danger" [pt]="$pcFileUpload.ptm('pcFileRemoveButton')" [unstyled]="unstyled()">
                    <ng-template #icon let-iconClass="class">
                        @if (fileRemoveIconTemplate()) {
                            <ng-template *ngTemplateOutlet="fileRemoveIconTemplate(); context: { class: iconClass, file: file, index: index }"></ng-template>
                        } @else {
                            <svg data-p-icon="times" [class]="iconClass" [attr.aria-hidden]="true" />
                        }
                    </ng-template>
                </p-button>
            </div>
        </div>
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FileUploadStyle],
    imports: [NgTemplateOutlet, Badge, Button, TimesIcon, Bind]
})
export class FileContent extends BaseComponent {
    _componentStyle = inject(FileUploadStyle);

    $pcFileUpload = inject(FILEUPLOAD_INSTANCE);

    onRemove = output<any>();

    files = input<any>();

    badgeSeverity = input<BadgeSeverity>('warn');

    badgeValue = input<string>();

    previewWidth = input<number>(50);

    fileRemoveIconTemplate = input<any>();

    onRemoveClick(event: any, index: number) {
        this.onRemove.emit({ event, index });
    }

    formatSize(bytes: number) {
        const k = 1024;
        const dm = 3;
        const sizes = this.config.getTranslation(TranslationKeys.FILE_SIZE_TYPES);

        if (bytes === 0) {
            return `0 ${sizes[0]}`;
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = (bytes / Math.pow(k, i)).toFixed(dm);

        return `${formattedSize} ${sizes[i]}`;
    }
}
/**
 * FileUpload is an advanced uploader with dragdrop support, multi file uploads, auto uploading, progress tracking and validations.
 * @group Components
 */
@Component({
    selector: 'p-fileupload, p-fileUpload',
    standalone: true,
    imports: [NgTemplateOutlet, Button, ProgressBar, Message, PlusIcon, UploadIcon, TimesIcon, SharedModule, FileContent, Bind],
    template: `
        @if (mode() === 'advanced') {
            <div [class]="cn(cx('root'), styleClass())" [style]="style()" [pBind]="ptm('root')">
                <input
                    [attr.aria-label]="browseFilesLabel"
                    #advancedfileinput
                    type="file"
                    (change)="onFileSelect($event)"
                    [multiple]="multiple()"
                    [accept]="accept()"
                    [disabled]="disabled() || isChooseDisabled()"
                    [attr.title]="''"
                    [pBind]="ptm('input')"
                />
                <div [class]="cx('header')" [pBind]="ptm('header')">
                    @if (!headerTemplate() && !_headerTemplate) {
                        <p-button
                            [styleClass]="cn(cx('pcChooseButton'), chooseStyleClass())"
                            [disabled]="disabled() || isChooseDisabled()"
                            (focus)="onFocus()"
                            [label]="chooseButtonLabel"
                            (blur)="onBlur()"
                            (onClick)="choose()"
                            (keydown.enter)="choose()"
                            [buttonProps]="chooseButtonProps()"
                            [pt]="ptm('pcChooseButton')"
                            [unstyled]="unstyled()"
                        >
                            <input
                                [attr.aria-label]="browseFilesLabel"
                                #advancedfileinput
                                type="file"
                                (change)="onFileSelect($event)"
                                [multiple]="multiple()"
                                [accept]="accept()"
                                [disabled]="disabled() || isChooseDisabled()"
                                [attr.title]="''"
                                [pBind]="ptm('input')"
                            />
                            <ng-template #icon>
                                @if (chooseIcon()) {
                                    <span [class]="chooseIcon()" [attr.aria-label]="true" [pBind]="ptm('pcChooseButton')?.icon"></span>
                                } @else {
                                    @if (!chooseIconTemplate() && !_chooseIconTemplate) {
                                        <svg data-p-icon="plus" [attr.aria-label]="true" [pBind]="ptm('pcChooseButton')?.icon" />
                                    }
                                    @if (chooseIconTemplate() || _chooseIconTemplate) {
                                        <span [attr.aria-label]="true" [pBind]="ptm('pcChooseButton')?.icon">
                                            <ng-template *ngTemplateOutlet="chooseIconTemplate() || _chooseIconTemplate"></ng-template>
                                        </span>
                                    }
                                }
                            </ng-template>
                        </p-button>

                        @if (!auto() && showUploadButton()) {
                            <p-button
                                [label]="uploadButtonLabel"
                                (onClick)="upload()"
                                [disabled]="!hasFiles() || isFileLimitExceeded()"
                                [styleClass]="cn(cx('pcUploadButton'), uploadStyleClass())"
                                [buttonProps]="uploadButtonProps()"
                                [pt]="ptm('pcUploadButton')"
                                [unstyled]="unstyled()"
                            >
                                <ng-template #icon>
                                    @if (uploadIcon()) {
                                        <span [class]="uploadIcon()" [attr.aria-hidden]="true" [pBind]="ptm('pcUploadButton')?.icon"></span>
                                    } @else {
                                        @if (!uploadIconTemplate() && !_uploadIconTemplate) {
                                            <svg data-p-icon="upload" [pBind]="ptm('pcUploadButton')?.icon" />
                                        }
                                        @if (uploadIconTemplate() || _uploadIconTemplate) {
                                            <span [attr.aria-hidden]="true" [pBind]="ptm('pcUploadButton')?.icon">
                                                <ng-template *ngTemplateOutlet="uploadIconTemplate() || _uploadIconTemplate"></ng-template>
                                            </span>
                                        }
                                    }
                                </ng-template>
                            </p-button>
                        }
                        @if (!auto() && showCancelButton()) {
                            <p-button
                                [label]="cancelButtonLabel"
                                (onClick)="clear()"
                                [disabled]="!hasFiles() || uploading"
                                [styleClass]="cn(cx('pcCancelButton'), cancelStyleClass())"
                                [buttonProps]="cancelButtonProps()"
                                [pt]="ptm('pcCancelButton')"
                                [unstyled]="unstyled()"
                            >
                                <ng-template #icon>
                                    @if (cancelIcon()) {
                                        <span [class]="cancelIcon()"></span>
                                    } @else {
                                        @if (!cancelIconTemplate() && !_cancelIconTemplate) {
                                            <svg data-p-icon="times" [attr.aria-hidden]="true" />
                                        }
                                        @if (cancelIconTemplate() || _cancelIconTemplate) {
                                            <span [attr.aria-hidden]="true">
                                                <ng-template *ngTemplateOutlet="cancelIconTemplate() || _cancelIconTemplate"></ng-template>
                                            </span>
                                        }
                                    }
                                </ng-template>
                            </p-button>
                        }
                    }
                    <ng-container
                        *ngTemplateOutlet="
                            headerTemplate() || _headerTemplate;
                            context: {
                                $implicit: _files,
                                uploadedFiles: uploadedFiles,
                                chooseCallback: choose.bind(this),
                                clearCallback: clear.bind(this),
                                uploadCallback: upload.bind(this)
                            }
                        "
                    ></ng-container>
                    <ng-container *ngTemplateOutlet="toolbarTemplate() || _toolbarTemplate"></ng-container>
                </div>
                <div #content [class]="cx('content')" (dragenter)="onDragEnter($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)" [pBind]="ptm('content')">
                    @if (contentTemplate() || _contentTemplate) {
                        <ng-container
                            *ngTemplateOutlet="
                                contentTemplate() || _contentTemplate;
                                context: {
                                    $implicit: _files,
                                    uploadedFiles: uploadedFiles,
                                    chooseCallback: choose.bind(this),
                                    clearCallback: clear.bind(this),
                                    removeUploadedFileCallback: removeUploadedFile.bind(this),
                                    removeFileCallback: remove.bind(this),
                                    progress: progress,
                                    messages: msgs
                                }
                            "
                        ></ng-container>
                    } @else {
                        @if (hasFiles()) {
                            <p-progressbar [value]="progress" [showValue]="false" [pt]="ptm('pcProgressBar')"></p-progressbar>
                        }
                        @for (message of msgs; track message) {
                            <p-message [severity]="message.severity" [text]="message.text" [pt]="ptm('pcMessage')" [unstyled]="unstyled()"></p-message>
                        }

                        @if (hasFiles()) {
                            <div [class]="cx('fileList')" [pBind]="ptm('fileList')">
                                @for (file of _files; track $index; let i = $index; let c = $count; let f = $first; let l = $last; let e = $even; let o = $odd) {
                                    <ng-container *ngTemplateOutlet="fileTemplate() || _fileTemplate; context: { $implicit: file, index: i, count: c, first: f, last: l, even: e, odd: o, ngForOf: _files }"></ng-container>
                                }
                                @if (!fileTemplate() && !_fileTemplate) {
                                    <div
                                        pFileContent
                                        [unstyled]="unstyled()"
                                        [files]="_files"
                                        (onRemove)="onRemoveClick($event)"
                                        [badgeValue]="pendingLabel"
                                        [previewWidth]="previewWidth()"
                                        [fileRemoveIconTemplate]="cancelIconTemplate() || _cancelIconTemplate"
                                    ></div>
                                }
                            </div>
                        }
                        @if (hasUploadedFiles()) {
                            <div [class]="cx('fileList')" [pBind]="ptm('fileList')">
                                @for (file of uploadedFiles; track $index; let i = $index; let c = $count; let f = $first; let l = $last; let e = $even; let o = $odd) {
                                    <ng-container *ngTemplateOutlet="fileTemplate() || _fileTemplate; context: { $implicit: file, index: i, count: c, first: f, last: l, even: e, odd: o, ngForOf: uploadedFiles }"></ng-container>
                                }
                                @if (!fileTemplate() && !_fileTemplate) {
                                    <div
                                        pFileContent
                                        [unstyled]="unstyled()"
                                        [files]="uploadedFiles"
                                        (onRemove)="onRemoveUploadedFileClick($event)"
                                        [badgeValue]="completedLabel()"
                                        badgeSeverity="success"
                                        [previewWidth]="previewWidth()"
                                        [fileRemoveIconTemplate]="cancelIconTemplate() || _cancelIconTemplate"
                                    ></div>
                                }
                            </div>
                        }
                    }
                    @if ((emptyTemplate() || _emptyTemplate) && !hasFiles() && !hasUploadedFiles()) {
                        <ng-container *ngTemplateOutlet="emptyTemplate() || _emptyTemplate" [pBind]="ptm('empty')"></ng-container>
                    }
                </div>
            </div>
        }
        @if (mode() === 'basic') {
            <div [class]="cn(cx('root'), styleClass())" [pBind]="ptm('root')">
                @for (message of msgs; track message) {
                    <p-message [severity]="message.severity" [text]="message.text" [pt]="ptm('pcMessage')" [unstyled]="unstyled()"></p-message>
                }

                <div [class]="cx('basicContent')" [pBind]="ptm('basicContent')">
                    <p-button
                        [styleClass]="cn(cx('pcChooseButton'), chooseStyleClass())"
                        [disabled]="disabled()"
                        [label]="chooseButtonLabel"
                        [style]="style()"
                        (onClick)="onBasicUploaderClick()"
                        (keydown)="onBasicKeydown($event)"
                        [buttonProps]="chooseButtonProps()"
                        [pt]="ptm('pcChooseButton')"
                        [unstyled]="unstyled()"
                    >
                        <ng-template #icon>
                            @if (hasFiles() && !auto()) {
                                @if (uploadIcon()) {
                                    <span [class]="cn('p-button-icon p-button-icon-left', uploadIcon())" [pBind]="ptm('pcChooseButton')?.icon"></span>
                                } @else {
                                    @if (!uploadIconTemplate() && !_uploadIconTemplate) {
                                        <svg data-p-icon="upload" [class]="'p-button-icon p-button-icon-left'" [pBind]="ptm('pcChooseButton')?.icon" />
                                    }
                                    @if (_uploadIconTemplate || uploadIconTemplate()) {
                                        <span class="p-button-icon p-button-icon-left" [pBind]="ptm('pcChooseButton')?.icon">
                                            <ng-template *ngTemplateOutlet="_uploadIconTemplate || uploadIconTemplate()"></ng-template>
                                        </span>
                                    }
                                }
                            } @else {
                                @if (chooseIcon()) {
                                    <span [class]="cn('p-button-icon p-button-icon-left pi', chooseIcon())" [pBind]="ptm('pcChooseButton')?.icon"></span>
                                } @else {
                                    @if (!chooseIconTemplate() && !_chooseIconTemplate) {
                                        <svg data-p-icon="plus" [pBind]="ptm('pcChooseButton')?.icon" />
                                    }
                                    <ng-template *ngTemplateOutlet="chooseIconTemplate() || _chooseIconTemplate"></ng-template>
                                }
                            }
                        </ng-template>
                        <input
                            [attr.aria-label]="browseFilesLabel"
                            #basicfileinput
                            type="file"
                            [accept]="accept()"
                            [multiple]="multiple()"
                            [disabled]="disabled()"
                            (change)="onFileSelect($event)"
                            (focus)="onFocus()"
                            (blur)="onBlur()"
                            [pBind]="ptm('input')"
                        />
                    </p-button>
                    @if (!auto()) {
                        @if (!fileLabelTemplate() && !_fileLabelTemplate) {
                            <span>
                                {{ basicFileChosenLabel() }}
                            </span>
                        } @else {
                            <ng-container *ngTemplateOutlet="fileLabelTemplate() || _fileLabelTemplate; context: { $implicit: _files }"></ng-container>
                        }
                    }
                </div>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [FileUploadStyle, { provide: FILEUPLOAD_INSTANCE, useExisting: FileUpload }, { provide: PARENT_INSTANCE, useExisting: FileUpload }],
    hostDirectives: [Bind]
})
export class FileUpload extends BaseComponent<FileUploadPassThrough> implements BlockableUI {
    componentName = 'FileUpload';

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    /**
     * Name of the request parameter to identify the files at backend.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Remote url to upload the files.
     * @group Props
     */
    readonly url = input<string | undefined>(undefined);
    /**
     * HTTP method to send the files to the url such as "post" and "put".
     * @group Props
     */
    readonly method = input<'post' | 'put' | undefined>('post');
    /**
     * Used to select multiple files at once from file dialog.
     * @group Props
     */
    readonly multiple = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Comma-separated list of pattern to restrict the allowed file types. Can be any combination of either the MIME types (such as "image/*") or the file extensions (such as ".jpg").
     * @group Props
     */
    readonly accept = input<string | undefined>(undefined);
    /**
     * Disables the upload functionality.
     * @group Props
     */
    readonly disabled = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * When enabled, upload begins automatically after selection is completed.
     * @group Props
     */
    readonly auto = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Cross-site Access-Control requests should be made using credentials such as cookies, authorization headers or TLS client certificates.
     * @group Props
     */
    readonly withCredentials = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Maximum file size allowed in bytes.
     * @group Props
     */
    readonly maxFileSize = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
    /**
     * Summary message of the invalid file size.
     * @group Props
     */
    readonly invalidFileSizeMessageSummary = input<string>('{0}: Invalid file size, ');
    /**
     * Detail message of the invalid file size.
     * @group Props
     */
    readonly invalidFileSizeMessageDetail = input<string>('maximum upload size is {0}.');
    /**
     * Summary message of the invalid file type.
     * @group Props
     */
    readonly invalidFileTypeMessageSummary = input<string>('{0}: Invalid file type, ');
    /**
     * Detail message of the invalid file type.
     * @group Props
     */
    readonly invalidFileTypeMessageDetail = input<string>('allowed file types: {0}.');
    /**
     * Detail message of the invalid file type.
     * @group Props
     */
    readonly invalidFileLimitMessageDetail = input<string>('limit is {0} at most.');
    /**
     * Summary message of the invalid file type.
     * @group Props
     */
    readonly invalidFileLimitMessageSummary = input<string>('Maximum number of files exceeded, ');
    /**
     * Inline style of the element.
     * @group Props
     */
    readonly style = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Class of the element.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Width of the image thumbnail in pixels.
     * @group Props
     */
    readonly previewWidth = input<number, unknown>(50, { transform: numberAttribute });
    /**
     * Label of the choose button. Defaults to Optimus Locale configuration.
     * @group Props
     */
    readonly chooseLabel = input<string | undefined>(undefined);
    /**
     * Label of the upload button. Defaults to Optimus Locale configuration.
     * @group Props
     */
    readonly uploadLabel = input<string | undefined>(undefined);
    /**
     * Label of the cancel button. Defaults to Optimus Locale configuration.
     * @group Props
     */
    readonly cancelLabel = input<string | undefined>(undefined);
    /**
     * Icon of the choose button.
     * @group Props
     */
    readonly chooseIcon = input<string | undefined>(undefined);
    /**
     * Icon of the upload button.
     * @group Props
     */
    readonly uploadIcon = input<string | undefined>(undefined);
    /**
     * Icon of the cancel button.
     * @group Props
     */
    readonly cancelIcon = input<string | undefined>(undefined);
    /**
     * Whether to show the upload button.
     * @group Props
     */
    readonly showUploadButton = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Whether to show the cancel button.
     * @group Props
     */
    readonly showCancelButton = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Defines the UI of the component.
     * @group Props
     */
    readonly mode = input<'advanced' | 'basic' | undefined>('advanced');
    /**
     * HttpHeaders class represents the header configuration options for an HTTP request.
     * @group Props
     */
    readonly headers = input<HttpHeaders | undefined>(undefined);
    /**
     * Whether to use the default upload or a manual implementation defined in uploadHandler callback. Defaults to Optimus Locale configuration.
     * @group Props
     */
    readonly customUpload = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Maximum number of files that can be uploaded.
     * @group Props
     */
    readonly fileLimit = input<number | undefined, unknown>(undefined, { transform: (value: unknown) => numberAttribute(value, undefined) });
    /**
     * Style class of the upload button.
     * @group Props
     */
    readonly uploadStyleClass = input<string | undefined>(undefined);
    /**
     * Style class of the cancel button.
     * @group Props
     */
    readonly cancelStyleClass = input<string | undefined>(undefined);
    /**
     * Style class of the remove button.
     * @group Props
     */
    readonly removeStyleClass = input<string | undefined>(undefined);
    /**
     * Style class of the choose button.
     * @group Props
     */
    readonly chooseStyleClass = input<string | undefined>(undefined);
    /**
     * Used to pass all properties of the ButtonProps to the choose button inside the component.
     * @group Props
     */
    readonly chooseButtonProps = input<ButtonProps | undefined>(undefined);
    /**
     * Used to pass all properties of the ButtonProps to the upload button inside the component.
     * @group Props
     */
    readonly uploadButtonProps = input<ButtonProps>({ severity: 'secondary' });
    /**
     * Used to pass all properties of the ButtonProps to the cancel button inside the component.
     * @group Props
     */
    readonly cancelButtonProps = input<ButtonProps>({ severity: 'secondary' });
    /**
     * Callback to invoke before file upload is initialized.
     * @param {FileBeforeUploadEvent} event - Custom upload event.
     * @group Emits
     */
    onBeforeUpload = output<FileBeforeUploadEvent>();
    /**
     * An event indicating that the request was sent to the server. Useful when a request may be retried multiple times, to distinguish between retries on the final event stream.
     * @param {FileSendEvent} event - Custom send event.
     * @group Emits
     */
    onSend = output<FileSendEvent>();
    /**
     * Callback to invoke when file upload is complete.
     * @param {FileUploadEvent} event - Custom upload event.
     * @group Emits
     */
    onUpload = output<FileUploadEvent>();
    /**
     * Callback to invoke if file upload fails.
     * @param {FileUploadErrorEvent} event - Custom error event.
     * @group Emits
     */
    onError = output<FileUploadErrorEvent>();
    /**
     * Callback to invoke when files in queue are removed without uploading using clear all button.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    readonly onClear = output<void>();
    /**
     * Callback to invoke when a file is removed without uploading using clear button of a file.
     * @param {FileRemoveEvent} event - Remove event.
     * @group Emits
     */
    onRemove = output<FileRemoveEvent>();
    /**
     * Callback to invoke when files are selected.
     * @param {FileSelectEvent} event - Select event.
     * @group Emits
     */
    onSelect = output<FileSelectEvent>();
    /**
     * Callback to invoke when files are being uploaded.
     * @param {FileProgressEvent} event - Progress event.
     * @group Emits
     */
    onProgress = output<FileProgressEvent>();
    /**
     * Callback to invoke in custom upload mode to upload the files manually.
     * @param {FileUploadHandlerEvent} event - Upload handler event.
     * @group Emits
     */
    uploadHandler = output<FileUploadHandlerEvent>();
    /**
     * This event is triggered if an error occurs while loading an image file.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onImageError = output<Event>();
    /**
     * This event is triggered if an error occurs while loading an image file.
     * @param {RemoveUploadedFileEvent} event - Remove event.
     * @group Emits
     */
    onRemoveUploadedFile = output<RemoveUploadedFileEvent>();

    /**
     * Custom file template.
     * @group Templates
     */
    readonly fileTemplate = contentChild<TemplateRef<void>>('file', { descendants: false });

    /**
     * Custom header template.
     * @param {FileUploadHeaderTemplateContext} context - header template context.
     * @group Templates
     */
    readonly headerTemplate = contentChild<TemplateRef<FileUploadHeaderTemplateContext>>('header', { descendants: false });

    /**
     * Custom content template.
     * @param {FileUploadContentTemplateContext} context - content template context.
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<FileUploadContentTemplateContext>>('content', { descendants: false });

    /**
     * Custom toolbar template.
     * @group Templates
     */
    readonly toolbarTemplate = contentChild<TemplateRef<void>>('toolbar', { descendants: false });

    /**
     * Custom choose icon template.
     * @group Templates
     */
    readonly chooseIconTemplate = contentChild<TemplateRef<void>>('chooseicon', { descendants: false });

    /**
     * Custom file label template.
     * @param {FileUploadFileLabelTemplateContext} context - file label template context.
     * @group Templates
     */
    readonly fileLabelTemplate = contentChild<TemplateRef<FileUploadFileLabelTemplateContext>>('filelabel', { descendants: false });

    /**
     * Custom upload icon template.
     * @group Templates
     */
    readonly uploadIconTemplate = contentChild<TemplateRef<void>>('uploadicon', { descendants: false });

    /**
     * Custom cancel icon template.
     * @group Templates
     */
    readonly cancelIconTemplate = contentChild<TemplateRef<void>>('cancelicon', { descendants: false });

    /**
     * Custom empty state template.
     * @group Templates
     */
    readonly emptyTemplate = contentChild<TemplateRef<void>>('empty', { descendants: false });

    readonly advancedFileInput = viewChild<ElementRef | any>('advancedfileinput');

    readonly basicFileInput = viewChild<ElementRef>('basicfileinput');

    readonly content = viewChild<ElementRef>('content');

    /**
     * Files to display. Valid files are copied into the internal list.
     * @group Props
     */
    readonly files = input<File[] | undefined>(undefined);

    public get basicButtonLabel(): string {
        if (this.auto() || !this.hasFiles()) {
            return this.chooseLabel() as string;
        }

        return this.uploadLabel() ?? this._files[0].name;
    }

    public _files: File[] = [];

    onChanges(changes: SimpleChanges) {
        if (changes['files']) {
            const files = this.files() || [];
            this._files = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                if (this.validate(file)) {
                    this.createObjectURL(file);

                    this._files.push(files[i]);
                }
            }

            this.revokeUnusedObjectURLs();
        }
    }

    public progress: number = 0;

    public dragHighlight: boolean | undefined;

    public msgs: any[] | undefined;

    public uploadedFileCount: number = 0;

    focus: boolean | undefined;

    uploading: boolean | undefined;

    duplicateIEEvent: boolean | undefined; // flag to recognize duplicate onchange event for file input

    translationSubscription: Subscription | undefined;

    dragOverListener: VoidListener;

    public uploadedFiles: File[] = [];

    private objectURLs = new Map<File, string>();

    private uploadSubscription: Subscription | undefined;

    private destroyRef = inject(DestroyRef);

    sanitizer: DomSanitizer = inject(DomSanitizer);

    zone: NgZone = inject(NgZone);

    http: HttpClient = inject(HttpClient);

    _componentStyle = inject(FileUploadStyle);

    onInit() {
        this.translationSubscription = this.config.translationObserver.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.cd.markForCheck();
        });
    }

    onAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.mode() === 'advanced') {
                this.zone.runOutsideAngular(() => {
                    const content = this.content();
                    if (content) {
                        this.dragOverListener = this.renderer.listen(content.nativeElement, 'dragover', this.onDragOver.bind(this));
                    }
                });
            }
        }
    }

    _headerTemplate: TemplateRef<FileUploadHeaderTemplateContext> | undefined;

    _contentTemplate: TemplateRef<FileUploadContentTemplateContext> | undefined;

    _toolbarTemplate: TemplateRef<void> | undefined;

    _chooseIconTemplate: TemplateRef<void> | undefined;

    _uploadIconTemplate: TemplateRef<void> | undefined;

    _cancelIconTemplate: TemplateRef<void> | undefined;

    _emptyTemplate: TemplateRef<void> | undefined;

    _fileTemplate: TemplateRef<void> | undefined;

    _fileLabelTemplate: TemplateRef<FileUploadFileLabelTemplateContext> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'file':
                    this._fileTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'toolbar':
                    this._toolbarTemplate = item.template;
                    break;

                case 'chooseicon':
                    this._chooseIconTemplate = item.template;
                    break;

                case 'uploadicon':
                    this._uploadIconTemplate = item.template;
                    break;

                case 'cancelicon':
                    this._cancelIconTemplate = item.template;
                    break;

                case 'empty':
                    this._emptyTemplate = item.template;
                    break;

                case 'filelabel':
                    this._fileLabelTemplate = item.template;
                    break;

                default:
                    this._fileTemplate = item.template;
                    break;
            }
        });
    }

    basicFileChosenLabel() {
        if (this.auto()) return this.chooseButtonLabel;
        else if (this.hasFiles()) {
            if (this._files && this._files.length === 1) return this._files[0].name;

            return this.config.getTranslation('fileChosenMessage')?.replace('{0}', this._files.length);
        }

        return this.config.getTranslation('noFileChosenMessage') || '';
    }

    completedLabel() {
        return this.config.getTranslation('completed') || '';
    }

    getTranslation(option: string) {
        return this.config.getTranslation(option);
    }

    choose() {
        this.advancedFileInput()?.nativeElement.click();
    }

    onFileSelect(event: any) {
        if (event.type !== 'drop' && this.isIE11() && this.duplicateIEEvent) {
            this.duplicateIEEvent = false;
            return;
        }

        if (!this.multiple()) {
            this._files = [];
        }

        this.msgs = [];
        this._files = this._files || [];
        let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;

        for (let i = 0; i < files.length; i++) {
            let file = files[i];

            if (!this.isFileSelected(file)) {
                if (this.validate(file)) {
                    this.createObjectURL(file);

                    this._files.push(files[i]);
                }
            }
        }

        this.onSelect.emit({ originalEvent: event, files: files, currentFiles: this._files });

        // this will check the fileLimit with the uploaded files
        this.checkFileLimit(files);

        if (this.hasFiles() && this.auto() && (this.mode() !== 'advanced' || !this.isFileLimitExceeded())) {
            this.upload();
        }

        if (event.type !== 'drop' && this.isIE11()) {
            this.clearIEInput();
        } else {
            this.clearInputElement();
        }
    }

    isFileSelected(file: File): boolean {
        for (let sFile of this._files) {
            if (sFile.name + sFile.type + sFile.size === file.name + file.type + file.size) {
                return true;
            }
        }

        return false;
    }

    isIE11() {
        if (isPlatformBrowser(this.platformId)) {
            return !!(this.document.defaultView as any)['MSInputMethodContext'] && !!(this.document as any)['documentMode'];
        }
    }

    validate(file: File): boolean {
        this.msgs = this.msgs || [];
        const accept = this.accept();
        if (accept && !this.isFileTypeValid(file)) {
            const text = `${this.invalidFileTypeMessageSummary().replace('{0}', file.name)} ${this.invalidFileTypeMessageDetail().replace('{0}', accept)}`;
            this.msgs.push({
                severity: 'error',
                text: text
            });
            return false;
        }

        const maxFileSize = this.maxFileSize();
        if (maxFileSize && file.size > maxFileSize) {
            const text = `${this.invalidFileSizeMessageSummary().replace('{0}', file.name)} ${this.invalidFileSizeMessageDetail().replace('{0}', this.formatSize(maxFileSize))}`;
            this.msgs.push({
                severity: 'error',
                text: text
            });
            return false;
        }

        return true;
    }

    private isFileTypeValid(file: File): boolean {
        let acceptableTypes = this.accept()
            ?.split(',')
            .map((type) => type.trim());
        for (let type of acceptableTypes!) {
            let acceptable = this.isWildcard(type) ? this.getTypeClass(file.type) === this.getTypeClass(type) : file.type == type || this.getFileExtension(file).toLowerCase() === type.toLowerCase();

            if (acceptable) {
                return true;
            }
        }

        return false;
    }

    getTypeClass(fileType: string): string {
        return fileType.substring(0, fileType.indexOf('/'));
    }

    isWildcard(fileType: string): boolean {
        return fileType.indexOf('*') !== -1;
    }

    getFileExtension(file: File): string {
        return '.' + file.name.split('.').pop();
    }

    isImage(file: File): boolean {
        return /^image\//.test(file.type);
    }

    /**
     * Creates (once per file) the preview url of an image and keeps the raw url to revoke it later.
     */
    private createObjectURL(file: any) {
        if (!this.isImage(file) || this.objectURLs.has(file)) {
            return;
        }

        const url = window.URL.createObjectURL(file);
        this.objectURLs.set(file, url);
        file.objectURL = this.sanitizer.bypassSecurityTrustUrl(url);
    }

    /**
     * Revokes the preview urls of the files that are neither queued nor uploaded anymore.
     */
    private revokeUnusedObjectURLs(all: boolean = false) {
        this.objectURLs.forEach((url, file) => {
            if (all || (!this._files.includes(file) && !this.uploadedFiles.includes(file))) {
                window.URL.revokeObjectURL(url);
                this.objectURLs.delete(file);
            }
        });
    }

    onImageLoad(img: any) {
        window.URL.revokeObjectURL(img.src);
    }
    /**
     * Uploads the selected files.
     * @group Method
     */
    uploader() {
        if (this.customUpload()) {
            if (this.fileLimit()) {
                this.uploadedFileCount += this._files.length;
            }

            this.uploadHandler.emit({
                files: this._files
            });

            this.cd.markForCheck();
        } else {
            this.uploading = true;
            this.msgs = [];
            let formData = new FormData();

            this.onBeforeUpload.emit({
                formData: formData
            });

            for (let i = 0; i < this._files.length; i++) {
                formData.append(this.name()!, this._files[i], this._files[i].name);
            }

            this.uploadSubscription?.unsubscribe();

            this.uploadSubscription = this.http
                .request(<string>this.method(), this.url() as string, {
                    body: formData,
                    headers: this.headers(),
                    reportProgress: true,
                    observe: 'events',
                    withCredentials: this.withCredentials()
                })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (event: HttpEvent<any>) => {
                        switch (event.type) {
                            case HttpEventType.Sent:
                                this.onSend.emit({
                                    originalEvent: event,
                                    formData: formData
                                });
                                break;
                            case HttpEventType.Response:
                                this.uploading = false;
                                this.progress = 0;
                                this.uploadSubscription = undefined;

                                if (event['status'] >= 200 && event['status'] < 300) {
                                    if (this.fileLimit()) {
                                        this.uploadedFileCount += this._files.length;
                                    }

                                    this.onUpload.emit({ originalEvent: event, files: this._files });
                                } else {
                                    this.onError.emit({ files: this._files });
                                }
                                this.uploadedFiles = [...this.uploadedFiles, ...this._files];
                                this.clear();
                                break;
                            case HttpEventType.UploadProgress: {
                                if (event['loaded']) {
                                    this.progress = Math.round((event['loaded'] * 100) / event['total']!);
                                }

                                this.onProgress.emit({ originalEvent: event, progress: this.progress });
                                break;
                            }
                        }

                        this.cd.markForCheck();
                    },
                    error: (error: ErrorEvent) => {
                        this.uploading = false;
                        this.progress = 0;
                        this.uploadSubscription = undefined;
                        this.onError.emit({ files: this._files, error: error });
                        this.cd.markForCheck();
                    }
                });
        }
    }
    onRemoveClick(e: any) {
        const { event, index } = e;
        if (this.hasFiles()) {
            this.remove(event, index);
        }
    }
    onRemoveUploadedFileClick(e: any) {
        const { index } = e;
        if (this.hasUploadedFiles()) {
            this.removeUploadedFile(index);
        }
    }
    /**
     * Clears the files list.
     * @group Method
     */
    clear() {
        this._files = [];
        this.revokeUnusedObjectURLs();
        this.onClear.emit();
        this.clearInputElement();
        this.msgs = [];
        this.cd.markForCheck();
    }
    /**
     * Removes a single file.
     * @param {Event} event - Browser event.
     * @param {Number} index - Index of the file.
     * @group Method
     */
    remove(event: Event, index: number) {
        this.clearInputElement();
        this.onRemove.emit({ originalEvent: event, file: this._files[index] });
        this._files.splice(index, 1);
        this.revokeUnusedObjectURLs();
        this.checkFileLimit(this._files);
        this.cd.markForCheck();
    }
    /**
     * Removes uploaded file.
     * @param {Number} index - Index of the file to be removed.
     * @group Method
     */
    removeUploadedFile(index: number) {
        let removedFile = this.uploadedFiles.splice(index, 1)[0];
        this.uploadedFiles = [...this.uploadedFiles];
        this.revokeUnusedObjectURLs();
        this.onRemoveUploadedFile.emit({ file: removedFile, files: this.uploadedFiles });
        this.cd.markForCheck();
    }

    isFileLimitExceeded() {
        const isAutoMode = this.auto();
        const totalFileCount = isAutoMode ? this._files.length : this._files.length + this.uploadedFileCount;

        const fileLimit = this.fileLimit();
        if (fileLimit && fileLimit <= totalFileCount && this.focus) {
            this.focus = false;
        }

        return fileLimit && fileLimit < totalFileCount;
    }

    isChooseDisabled() {
        if (this.auto()) {
            const fileLimit = this.fileLimit();
            return fileLimit && fileLimit <= this._files.length;
        } else {
            const fileLimit = this.fileLimit();
            return fileLimit && fileLimit <= this._files.length + this.uploadedFileCount;
        }
    }

    checkFileLimit(files: File[]) {
        this.msgs ??= [];
        const fileLimit = this.fileLimit();
        const hasExistingValidationMessages = this.msgs.length > 0 && fileLimit && fileLimit < files.length;

        if (this.isFileLimitExceeded() || hasExistingValidationMessages) {
            const text = `${this.invalidFileLimitMessageSummary().replace('{0}', (this.fileLimit() as number).toString())} ${this.invalidFileLimitMessageDetail().replace('{0}', (this.fileLimit() as number).toString())}`;
            this.msgs.push({
                severity: 'error',
                text: text
            });
        } else {
            this.msgs = this.msgs.filter((msg) => !msg.text.includes(this.invalidFileLimitMessageSummary()));
        }
    }

    clearInputElement() {
        const advancedFileInput = this.advancedFileInput();
        if (advancedFileInput && advancedFileInput.nativeElement) {
            advancedFileInput.nativeElement.value = '';
        }

        const basicFileInput = this.basicFileInput();
        if (basicFileInput && basicFileInput.nativeElement) {
            basicFileInput.nativeElement.value = '';
        }
    }

    clearIEInput() {
        const advancedFileInput = this.advancedFileInput();
        if (advancedFileInput && advancedFileInput.nativeElement) {
            this.duplicateIEEvent = true; //IE11 fix to prevent onFileChange trigger again
            advancedFileInput.nativeElement.value = '';
        }
    }

    hasFiles(): boolean {
        return this._files && this._files.length > 0;
    }

    hasUploadedFiles() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    onDragEnter(e: DragEvent) {
        if (!this.disabled()) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    onDragOver(e: DragEvent) {
        if (!this.disabled()) {
            !this.$unstyled() && addClass(this.content()?.nativeElement, 'p-fileupload-highlight');
            this.content()?.nativeElement.setAttribute('data-p-highlight', true);
            this.dragHighlight = true;
            e.stopPropagation();
            e.preventDefault();
        }
    }

    onDragLeave(event: DragEvent) {
        if (!this.disabled()) {
            !this.$unstyled() && removeClass(this.content()?.nativeElement, 'p-fileupload-highlight');
            this.content()?.nativeElement.setAttribute('data-p-highlight', false);
        }
    }

    onDrop(event: any) {
        if (!this.disabled()) {
            !this.$unstyled() && removeClass(this.content()?.nativeElement, 'p-fileupload-highlight');
            this.content()?.nativeElement.setAttribute('data-p-highlight', false);
            event.stopPropagation();
            event.preventDefault();

            let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
            let allowDrop = this.multiple() || (files && files.length === 1);

            if (allowDrop) {
                this.onFileSelect(event);
            }
        }
    }

    onFocus() {
        this.focus = true;
    }

    onBlur() {
        this.focus = false;
    }

    formatSize(bytes: number) {
        const k = 1024;
        const dm = 3;
        const sizes = this.getTranslation(TranslationKeys.FILE_SIZE_TYPES);

        if (bytes === 0) {
            return `0 ${sizes[0]}`;
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = (bytes / Math.pow(k, i)).toFixed(dm);

        return `${formattedSize} ${sizes[i]}`;
    }

    upload() {
        if (this.hasFiles()) this.uploader();
    }

    onBasicUploaderClick() {
        this.basicFileInput()?.nativeElement.click();
    }

    onBasicKeydown(event: KeyboardEvent) {
        switch (event.code) {
            case 'Space':
            case 'Enter':
                this.onBasicUploaderClick();

                event.preventDefault();
                break;
        }
    }

    imageError(event: Event) {
        this.onImageError.emit(event);
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    get chooseButtonLabel(): string {
        return this.chooseLabel() || this.config.getTranslation(TranslationKeys.CHOOSE);
    }

    get uploadButtonLabel(): string {
        return this.uploadLabel() || this.config.getTranslation(TranslationKeys.UPLOAD);
    }

    get cancelButtonLabel(): string {
        return this.cancelLabel() || this.config.getTranslation(TranslationKeys.CANCEL);
    }

    get browseFilesLabel(): string {
        return this.config.getTranslation(TranslationKeys.ARIA)[TranslationKeys.BROWSE_FILES];
    }

    get pendingLabel() {
        return this.config.getTranslation(TranslationKeys.PENDING);
    }

    onDestroy() {
        const content = this.content();
        if (content && content.nativeElement) {
            if (this.dragOverListener) {
                this.dragOverListener();
                this.dragOverListener = null;
            }
        }

        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }

        this.uploadSubscription?.unsubscribe();
        this.uploadSubscription = undefined;
        this.revokeUnusedObjectURLs(true);
    }
}

@NgModule({
    imports: [FileUpload, SharedModule],
    exports: [FileUpload, SharedModule]
})
export class FileUploadModule {}
