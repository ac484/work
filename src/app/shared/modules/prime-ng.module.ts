// 本模組為 PrimeNG 元件集中匯入/匯出模組
// 功能：統一管理 PrimeNG 20+ 所有常用元件
// 用途：便於全域與特定模組引用 PrimeNG UI
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// PrimeNG modules (現代化 v20)
import { AccordionModule } from 'primeng/accordion';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InplaceModule } from 'primeng/inplace';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { MeterGroupModule } from 'primeng/metergroup';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PickListModule } from 'primeng/picklist';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollerModule } from 'primeng/scroller';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepperModule } from 'primeng/stepper';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TerminalModule } from 'primeng/terminal';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { MegaMenuModule } from 'primeng/megamenu';
import { MultiSelectModule } from 'primeng/multiselect';
import { CarouselModule } from 'primeng/carousel';
import { BlockUIModule } from 'primeng/blockui';
import { PasswordModule } from 'primeng/password';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    AnimateOnScrollModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CascadeSelectModule,
    CheckboxModule,
    ChipModule,
    ColorPickerModule,
    ConfirmDialogModule,
    ContextMenuModule,
    DataViewModule,
    DatePickerModule,
    DialogModule,
    DragDropModule,
    DynamicDialogModule,
    FileUploadModule,
    InplaceModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    InputOtpModule,
    InputTextModule,
    KeyFilterModule,
    KnobModule,
    ListboxModule,
    MenuModule,
    MenubarModule,
    MessageModule,
    MeterGroupModule,
    OrderListModule,
    OrganizationChartModule,
    PaginatorModule,
    PanelModule,
    PickListModule,
    PopoverModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    RatingModule,
    RippleModule,
    ScrollPanelModule,
    ScrollerModule,
    SelectButtonModule,
    SelectModule,
    SkeletonModule,
    SliderModule,
    SplitButtonModule,
    SplitterModule,
    StepperModule,
    StyleClassModule,
    TableModule,
    TagModule,
    TabsModule,
    TerminalModule,
    TimelineModule,
    ToastModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeModule,
    TreeTableModule,
    GalleriaModule,
    ImageModule,
    MegaMenuModule,
    MultiSelectModule,
    CarouselModule,
    BlockUIModule,
    PasswordModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    AnimateOnScrollModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CascadeSelectModule,
    CheckboxModule,
    ChipModule,
    ColorPickerModule,
    ConfirmDialogModule,
    ContextMenuModule,
    DataViewModule,
    DatePickerModule,
    DialogModule,
    DragDropModule,
    DynamicDialogModule,
    FileUploadModule,
    InplaceModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    InputOtpModule,
    InputTextModule,
    KeyFilterModule,
    KnobModule,
    ListboxModule,
    MenuModule,
    MenubarModule,
    MessageModule,
    MeterGroupModule,
    OrderListModule,
    OrganizationChartModule,
    PaginatorModule,
    PanelModule,
    PickListModule,
    PopoverModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    RatingModule,
    RippleModule,
    ScrollPanelModule,
    ScrollerModule,
    SelectButtonModule,
    SelectModule,
    SkeletonModule,
    SliderModule,
    SplitButtonModule,
    SplitterModule,
    StepperModule,
    StyleClassModule,
    TableModule,
    TagModule,
    TabsModule,
    TerminalModule,
    TimelineModule,
    ToastModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeModule,
    TreeTableModule,
    GalleriaModule,
    ImageModule,
    MegaMenuModule,
    MultiSelectModule,
    CarouselModule,
    BlockUIModule,
    PasswordModule,
  ],
  providers: [DialogService],
})
export class PrimeNgModule {}
