import type { Preset } from '@openng/optimus-ui-themes/types';
import type { MaterialBaseDesignTokens } from './base/index.d';

import accordion from '@openng/optimus-ui-themes/material/accordion';
import autocomplete from '@openng/optimus-ui-themes/material/autocomplete';
import avatar from '@openng/optimus-ui-themes/material/avatar';
import badge from '@openng/optimus-ui-themes/material/badge';
import aiassistview from '@openng/optimus-ui-themes/material/aiassistview';
import barcode from '@openng/optimus-ui-themes/material/barcode';
import blockeditor from '@openng/optimus-ui-themes/material/blockeditor';
import charts from '@openng/optimus-ui-themes/material/charts';
import cropper from '@openng/optimus-ui-themes/material/cropper';
import dashboardlayout from '@openng/optimus-ui-themes/material/dashboardlayout';
import gantt from '@openng/optimus-ui-themes/material/gantt';
import gauge from '@openng/optimus-ui-themes/material/gauge';
import map from '@openng/optimus-ui-themes/material/map';
import mention from '@openng/optimus-ui-themes/material/mention';
import pdfeditor from '@openng/optimus-ui-themes/material/pdfeditor';
import querybuilder from '@openng/optimus-ui-themes/material/querybuilder';
import scheduler from '@openng/optimus-ui-themes/material/scheduler';
import signature from '@openng/optimus-ui-themes/material/signature';
import spreadsheet from '@openng/optimus-ui-themes/material/spreadsheet';
import taskboard from '@openng/optimus-ui-themes/material/taskboard';
import texteditor from '@openng/optimus-ui-themes/material/texteditor';
import base from '@openng/optimus-ui-themes/material/base';
import blockui from '@openng/optimus-ui-themes/material/blockui';
import breadcrumb from '@openng/optimus-ui-themes/material/breadcrumb';
import button from '@openng/optimus-ui-themes/material/button';
import card from '@openng/optimus-ui-themes/material/card';
import carousel from '@openng/optimus-ui-themes/material/carousel';
import cascadeselect from '@openng/optimus-ui-themes/material/cascadeselect';
import checkbox from '@openng/optimus-ui-themes/material/checkbox';
import chip from '@openng/optimus-ui-themes/material/chip';
import colorpicker from '@openng/optimus-ui-themes/material/colorpicker';
import confirmdialog from '@openng/optimus-ui-themes/material/confirmdialog';
import confirmpopup from '@openng/optimus-ui-themes/material/confirmpopup';
import contextmenu from '@openng/optimus-ui-themes/material/contextmenu';
import datatable from '@openng/optimus-ui-themes/material/datatable';
import dataview from '@openng/optimus-ui-themes/material/dataview';
import datepicker from '@openng/optimus-ui-themes/material/datepicker';
import dialog from '@openng/optimus-ui-themes/material/dialog';
import divider from '@openng/optimus-ui-themes/material/divider';
import dock from '@openng/optimus-ui-themes/material/dock';
import drawer from '@openng/optimus-ui-themes/material/drawer';
import editor from '@openng/optimus-ui-themes/material/editor';
import fieldset from '@openng/optimus-ui-themes/material/fieldset';
import fileupload from '@openng/optimus-ui-themes/material/fileupload';
import floatlabel from '@openng/optimus-ui-themes/material/floatlabel';
import galleria from '@openng/optimus-ui-themes/material/galleria';
import iconfield from '@openng/optimus-ui-themes/material/iconfield';
import iftalabel from '@openng/optimus-ui-themes/material/iftalabel';
import image from '@openng/optimus-ui-themes/material/image';
import imagecompare from '@openng/optimus-ui-themes/material/imagecompare';
import inlinemessage from '@openng/optimus-ui-themes/material/inlinemessage';
import inplace from '@openng/optimus-ui-themes/material/inplace';
import inputchips from '@openng/optimus-ui-themes/material/inputchips';
import inputgroup from '@openng/optimus-ui-themes/material/inputgroup';
import inputnumber from '@openng/optimus-ui-themes/material/inputnumber';
import inputotp from '@openng/optimus-ui-themes/material/inputotp';
import inputtext from '@openng/optimus-ui-themes/material/inputtext';
import knob from '@openng/optimus-ui-themes/material/knob';
import listbox from '@openng/optimus-ui-themes/material/listbox';
import megamenu from '@openng/optimus-ui-themes/material/megamenu';
import menu from '@openng/optimus-ui-themes/material/menu';
import menubar from '@openng/optimus-ui-themes/material/menubar';
import message from '@openng/optimus-ui-themes/material/message';
import metergroup from '@openng/optimus-ui-themes/material/metergroup';
import multiselect from '@openng/optimus-ui-themes/material/multiselect';
import orderlist from '@openng/optimus-ui-themes/material/orderlist';
import organizationchart from '@openng/optimus-ui-themes/material/organizationchart';
import overlaybadge from '@openng/optimus-ui-themes/material/overlaybadge';
import paginator from '@openng/optimus-ui-themes/material/paginator';
import panel from '@openng/optimus-ui-themes/material/panel';
import panelmenu from '@openng/optimus-ui-themes/material/panelmenu';
import password from '@openng/optimus-ui-themes/material/password';
import picklist from '@openng/optimus-ui-themes/material/picklist';
import popover from '@openng/optimus-ui-themes/material/popover';
import progressbar from '@openng/optimus-ui-themes/material/progressbar';
import progressspinner from '@openng/optimus-ui-themes/material/progressspinner';
import radiobutton from '@openng/optimus-ui-themes/material/radiobutton';
import rating from '@openng/optimus-ui-themes/material/rating';
import ripple from '@openng/optimus-ui-themes/material/ripple';
import scrollpanel from '@openng/optimus-ui-themes/material/scrollpanel';
import select from '@openng/optimus-ui-themes/material/select';
import selectbutton from '@openng/optimus-ui-themes/material/selectbutton';
import skeleton from '@openng/optimus-ui-themes/material/skeleton';
import slider from '@openng/optimus-ui-themes/material/slider';
import speeddial from '@openng/optimus-ui-themes/material/speeddial';
import splitbutton from '@openng/optimus-ui-themes/material/splitbutton';
import splitter from '@openng/optimus-ui-themes/material/splitter';
import stepper from '@openng/optimus-ui-themes/material/stepper';
import steps from '@openng/optimus-ui-themes/material/steps';
import tabmenu from '@openng/optimus-ui-themes/material/tabmenu';
import tabs from '@openng/optimus-ui-themes/material/tabs';
import tabview from '@openng/optimus-ui-themes/material/tabview';
import tag from '@openng/optimus-ui-themes/material/tag';
import terminal from '@openng/optimus-ui-themes/material/terminal';
import textarea from '@openng/optimus-ui-themes/material/textarea';
import tieredmenu from '@openng/optimus-ui-themes/material/tieredmenu';
import timeline from '@openng/optimus-ui-themes/material/timeline';
import toast from '@openng/optimus-ui-themes/material/toast';
import togglebutton from '@openng/optimus-ui-themes/material/togglebutton';
import toggleswitch from '@openng/optimus-ui-themes/material/toggleswitch';
import toolbar from '@openng/optimus-ui-themes/material/toolbar';
import tooltip from '@openng/optimus-ui-themes/material/tooltip';
import tree from '@openng/optimus-ui-themes/material/tree';
import treeselect from '@openng/optimus-ui-themes/material/treeselect';
import treetable from '@openng/optimus-ui-themes/material/treetable';
import virtualscroller from '@openng/optimus-ui-themes/material/virtualscroller';

export default {
    ...base,
    components: {
        aiassistview,
        barcode,
        blockeditor,
        charts,
        cropper,
        dashboardlayout,
        gantt,
        gauge,
        map,
        mention,
        pdfeditor,
        querybuilder,
        scheduler,
        signature,
        spreadsheet,
        taskboard,
        texteditor,
        accordion,
        autocomplete,
        avatar,
        badge,
        blockui,
        breadcrumb,
        button,
        datepicker,
        card,
        carousel,
        cascadeselect,
        checkbox,
        chip,
        colorpicker,
        confirmdialog,
        confirmpopup,
        contextmenu,
        dataview,
        datatable,
        dialog,
        divider,
        dock,
        drawer,
        editor,
        fieldset,
        fileupload,
        iftalabel,
        floatlabel,
        galleria,
        iconfield,
        image,
        imagecompare,
        inlinemessage,
        inplace,
        inputchips,
        inputgroup,
        inputnumber,
        inputotp,
        inputtext,
        knob,
        listbox,
        megamenu,
        menu,
        menubar,
        message,
        metergroup,
        multiselect,
        orderlist,
        organizationchart,
        overlaybadge,
        popover,
        paginator,
        password,
        panel,
        panelmenu,
        picklist,
        progressbar,
        progressspinner,
        radiobutton,
        rating,
        ripple,
        scrollpanel,
        select,
        selectbutton,
        skeleton,
        slider,
        speeddial,
        splitter,
        splitbutton,
        stepper,
        steps,
        tabmenu,
        tabs,
        tabview,
        textarea,
        tieredmenu,
        tag,
        terminal,
        timeline,
        togglebutton,
        toggleswitch,
        tree,
        treeselect,
        treetable,
        toast,
        toolbar,
        tooltip,
        virtualscroller
    }
} satisfies Preset<MaterialBaseDesignTokens>;
