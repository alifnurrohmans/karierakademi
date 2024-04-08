//LOCAL
var base_url = location.origin + "/karierakademiapp";

//PROD
// var base_url = location.origin;

let datanext = 0, dataprev = 0, limit = 10;
let request  = {"filter": {}};
let act = "", getfunc = "";
let targethtml = "";

var l = $(".ladda-button-submit").ladda();

$(".select2").select2({
    width: '100%',
    // theme: 'bootstrap4',
    // dropdownParent: $('.modal'),
    // placeholder: $(this).data('placeholder'),
    // allowClear: Boolean($(this).data('allow-clear')),
});

function select2set(parent, target, enabled = false, textplaceholder = 'Loading...', loading = true, data = '', id = '') {
    parent.find(".dropdown-"+target).select2({
        dropdownParent: parent,
        width: '100%',
        disabled: !(enabled),
        placeholder: textplaceholder
    });
    
    let rHtml = '<option label='+textplaceholder+'></option>';
    rHtml += data;
    parent.find(".dropdown-"+target).html(rHtml);
    parent.find(".dropdown-"+target).val(id).change();

    if(enabled) parent.find(".loading-dropdown-"+target).addClass('d-none');
    else parent.find(".loading-dropdown-"+target).removeClass('d-none');

    if(loading == false) parent.find(".loading-dropdown-"+target).addClass('d-none');
}

$(".modal").on('shown.bs.modal', function() {
    $("input:first").focus();
});
$(".modal").on('hidden.bs.modal', function() {
    $("#Frm").trigger("reset");
    $("#Frm").find(".form-select").val('').trigger('change');
});

function ResetRequest() {
    limit = 10;
    targethtml = "";
    request  = {"filter": {}};
}

function toastr(title, text, position, loaderBg, icon) {
    // $("body").removeAttr('class');
    $.toast({
        heading: title,
        text: text,
        position: position,
        loaderBg: loaderBg,
        icon: icon,
        hideAfter: 4000,
        stack: 6
    });

    return false;
}

function toastrshow(type, title, message) {
    message = (typeof message !== 'undefined') ?  message : "";

    switch(type) {
        case "success" : toastr(message, title, 'top-right', '#e69a2a', 'success');     break;
        case "info"    : toastr(message, title, 'top-right', '#e69a2a', 'info');        break;
        case "warning" : toastr(message, title, 'top-right', '#e69a2a', 'warning');     break;
        case "error"   : toastr(message, title, 'top-right', '#e69a2a', 'error');       break;
        default        : toastr(message, title, 'top-right', '#e69a2a', 'info');        break;
    }
}

// function SearchBox(search, response) {
//     $('.'+search).on('input', function() {
//         response($(this).val());
//     });
// }

function resetformvalue(selector) {
    $(selector).trigger("reset"); //Reset value di form. Kecuali Select2
    // $(selector + " select").val("").trigger("change"); //Reset seluruh Select2 yang ada di form
}

function backAway() {
    if(history.length === 1){
        history.back();
    } else {
        history.back();
    }
}

function loader(withtable, colspan) {
    colspan = (colspan != "") ? colspan : "10";
    withtable = (typeof withtable !== 'undefined') ?  withtable : false;
    positioning = (!withtable) ? 'loading-gif-image center' : 'loading-gif-image';
    var html  = '';
    if(withtable == true) html += "<tr><td colspan='"+colspan+"' class='text-center'>";
    html += '<center><img class="'+positioning+'" src="'+base_url+'/assets/images/loading.gif" alt="Loading..."></center>';
    if(withtable == true) html += "</td>";
    return html;
}

function date_indo(tgl) {
    var hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var bulan = ['Januari', 'Februari', 'Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    var tanggal = new Date(tgl).getDate();
    var xhari = new Date(tgl).getDay();
    var xbulan = new Date(tgl).getMonth();
    var xtahun = new Date(tgl).getYear();

    var hari = hari[xhari];
    var bulan = bulan[xbulan];
    var tahun = (xtahun < 1000)?xtahun + 1900 : xtahun;
    return hari +', ' + tanggal + ' ' + bulan + ' ' + tahun;
}

function ConvertTime(time, format = "H:i") {
    var his = time.split(':');

    var h = his[0];
    var i = his[1];
    var s = his[2];

    if(format == "H:i") {
        return h+":"+i;
    }

    return time;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function GetDataList(req, action, table, successfunc, colspan) {
    // colspan = (colspan != "") ? colspan : "10";
    colspan = (typeof colspan !== 'undefined') ? colspan : "10";
    req = (typeof req !== 'undefined') ?  req : "";
    successfunc = (typeof successfunc !== 'undefined') ? successfunc : "";
    act = (action != "") ? action : "listdatahtml";
    $.ajax({
        type: "POST",
        url: base_url + pagename,
        data: {act:act, req:req},
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            if(targethtml != "") $("."+targethtml).html(loader(false));
            else $(".datatable-"+table+" tbody").html(loader(true, colspan));
        },
        success: function(resp) {
            if(resp.lsdt == 'SESS_UNAUTHORIZED' || resp.lsdt == 'SESS_ERROR') {
                window.location.href = base_url + '/auth/logout.html';
            }else{
                if(resp.meta != null && resp.links != null) {
                    pagination(resp.meta, resp.links, table);
                } else {
                    $(".pagination-layout-"+table).addClass("d-none");
                }

                if(targethtml != "") $("."+targethtml).html(resp.lsdt);
                else $(".datatable-"+table+" tbody").html(resp.lsdt);

                if(successfunc != "") {
                    getfunc = successfunc;
                    successfunc(resp);
                }
            }
        },
        error: function(xhr, textstatus, errorthrown) {
            console.log(xhr);
            $(".datatable-"+table+" tbody").html("<tr><td colspan='"+colspan+"' class='text-center'><span class='badge rounded-pill bg-warning'>Periksa koneksi internet anda kembali</span></td></tr>");
            $(".pagination-layout-"+table).addClass("d-none");
            toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
        }
    });
}

function GetListItem(req, action, classdata, successfunc) {
    req = (typeof req !== 'undefined') ?  req : "";
    successfunc = (typeof successfunc !== 'undefined') ? successfunc : "";
    act = (action != "") ? action : "listdatahtml";
    $.ajax({
        type: "POST",
        url: base_url + pagename,
        data: {act:act, req:req},
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            $(".item-list-"+classdata).html(loader(false));
        },
        success: function(resp) {
            if(resp.lsdt == 'SESS_UNAUTHORIZED' || resp.lsdt == 'SESS_ERROR') {
                window.location.href = base_url + '/auth/logout.html';
            }else{
                if(resp.meta != null && resp.links != null) {
                    pagination(resp.meta, resp.links, classdata);
                } else {
                    $(".pagination-layout-"+classdata).addClass("d-none");
                }

                $(".item-list-"+classdata).html(resp.lsdt);

                if(successfunc != "") {
                    getfunc = successfunc;
                    successfunc(resp);
                }
            }
        },
        error: function(xhr, textstatus, errorthrown) {
            console.log(xhr);
            $(".item-list-"+classdata).html("<span class='badge rounded-pill bg-warning'>Periksa koneksi internet anda kembali</span>");
            $(".pagination-layout-"+classdata).addClass("d-none");
            toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
        }
    });
}

function GetData(req, action, table, successfunc, colspan) {
    colspan = (colspan != "") ? colspan : "10";
    req = (typeof req !== 'undefined') ?  req : "";
    successfunc = (typeof successfunc !== 'undefined') ? successfunc : "";
    act = (action != "") ? action : "listdatahtml";
    $.ajax({
        type: "POST",
        url: base_url + pagename,
        data: {act:act, req:req},
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            if(targethtml != "") $("."+targethtml).html(loader(false));
            else $(".datatable-"+table+" tbody").html(loader(true, colspan));
        },
        success: function(resp){
            if(resp.lsdt == 'SESS_UNAUTHORIZED' || resp.lsdt == 'SESS_ERROR') {
                window.location.href = base_url + '/auth/logout.html';
            }else{
                if(targethtml != "") $("."+targethtml).html(resp.lsdt);
                else $(".datatable-"+table+" tbody").html(resp.lsdt);
                
                successfunc(resp);
            }
            // if(resp.paging.Total != undefined) {
            //     // $(".datatable-"+table+" tbody").html(resp.lsdt);
            //     // pagination(resp.paging, table);
            //     if(successfunc != "") {
            //         getfunc = successfunc;
            //         successfunc(resp);
            //     }
            // } else {
            //     // $(".datatable-"+table+" tbody").html(resp.lsdt);
            //     // $(".pagination-layout-"+table).addClass("d-none");
            //     if(successfunc != "") {
            //         getfunc = successfunc;
            //         successfunc(resp);
            //     }
            // }
        },
        error: function(xhr, textstatus, errorthrown) {
            console.log(xhr);
            // $(".datatable-"+table+" tbody").html("<tr><td colspan='"+colspan+"' class='text-center'><span class='badge badge-pill badge-warning'>Periksa koneksi internet anda kembali</span></td></tr>");
            //$(".pagination-layout-"+table).addClass("d-none");
            toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
        }
    });
}

function GetDataFull(req, action, successfunc) {
    req = (typeof req !== 'undefined') ?  req : "";
    successfunc = (typeof successfunc !== 'undefined') ? successfunc : "";
    act = (action != "") ? action : "listdatahtml";
    $.ajax({
        type: "POST",
        url: base_url + pagename,
        data: {act:act, req:req},
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        success: function(resp){
            if(!resp.status) {
                if(resp.message == "SESS_UNAUTHORIZED"){
                    window.location.href = base_url + "/auth/logout.html";
                    toastrshow("error", "Sesi User telah habis atau Pengguna lainnya telah login", "Error");
                // }else if(resp.ErrMessage == "PERMISSION"){
                //     window.location.href = base_url;
                //     toastrshow("error", "Anda tidak memiliki akses", "Error");
                }else{
                    toastrshow("error", resp.message, "Error");
                }
            }
            successfunc(resp);
        },
        error: function(xhr, textstatus, errorthrown) {
            console.log(xhr);
            toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
        }
    });
}

function InsertData(selectorform, successfunc, errorfunc) {
    successfunc = (typeof successfunc !== 'undefined') ?  successfunc : "";
    errorfunc = (typeof errorfunc !== 'undefined') ?  errorfunc : "";
    var formdata   = $(selectorform).serialize() +"&act=insertdata";
    var formaction = $(selectorform).attr("action");
    $.ajax({
        type: "POST",
        url: base_url + formaction,
        data: formdata,
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            l.ladda("start");
        },
        success: function(resp){
            if(resp.status) {
                if(successfunc != "") {
                    successfunc(resp);
                }
                
                $("#Frm").trigger("reset");
                $("#Frm").find(".form-select").val('').trigger('change');
                toastrshow("success", "Data berhasil disimpan", "Success");
            } else {
                if(resp.message == "SESS_UNAUTHORIZED"){
                    window.location.href = base_url + "/auth/logout.html";
                    toastrshow("error", "Sesi User telah habis atau Pengguna lainnya telah login", "Error");
                // }else if(resp.ErrMessage == "PERMISSION"){
                //     window.location.href = base_url;
                //     toastrshow("error", "Anda tidak memiliki akses", "Error");
                }else{
                    toastrshow("error", resp.message, "Error");
                }

                if(errorfunc != "") {
                    errorfunc(resp);
                }
            }

            l.ladda("stop");
        },
        error: function(xhr, textstatus, errorthrown) {
            setTimeout(function(){
                l.ladda("stop");
                toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
            }, 500);
            console.log(xhr);
        }
    });
}

function PostData(data, act, successfunc, loading = true, msg = true) {
    var formdata = data+"&act="+act;
    $.ajax({
        type: "POST",
        url: base_url + pagename,
        data: formdata,
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            if(loading==true) l.ladda("start");
        },
        success: function(resp){
            if(resp.status) {
                if(msg==true) toastrshow("success", "Data berhasil disimpan", "Success");
            }else{
                // console.log(resp);
                if(resp.message == "SESS_UNAUTHORIZED"){
                    window.location.href = base_url + "/auth/logout.html";
                    if(msg==true) toastrshow("error", "Sesi User telah habis atau Pengguna lainnya telah login", "Error");
                // }else if(resp.ErrMessage == "PERMISSION"){
                //     window.location.href = base_url;
                //     if(msg==true) toastrshow("error", "Anda tidak memiliki akses", "Error");
                }else{
                    if(msg==true) toastrshow("error", resp.message, "Error");
                }
            }
            successfunc(resp);
            setTimeout(function(){
                if(loading==true) l.ladda("stop");
            }, 300);
        },
        error: function(xhr, textstatus, errorthrown) {
            setTimeout(function(){
                if(loading==true) l.ladda("stop");
                toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
            }, 500);
            console.log(xhr);
        }
    });
}

function UpdateData(selectorform, successfunc, errorfunc) {
    successfunc = (typeof successfunc !== 'undefined') ?  successfunc : "";
    errorfunc = (typeof errorfunc !== 'undefined') ?  errorfunc : "";
    var formdata   = $(selectorform).serialize() +"&act=updatedata";
    var formaction = $(selectorform).attr("action");
    $.ajax({
        type: "POST",
        url: base_url + formaction,
        data: formdata,
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            l.ladda("start");
        },
        success: function(resp){
            if(resp.status) {
                toastrshow("success", "Data berhasil disimpan", "Success");
                $("#Frm").trigger("reset");

                if(successfunc != "") {
                    successfunc(resp);
                }
            } else {
                if(resp.message == "SESS_UNAUTHORIZED"){
                    window.location.href = base_url + "/auth/logout.html";
                    toastrshow("error", "Sesi User telah habis atau Pengguna lainnya telah login", "Error");
                // }else if(resp.ErrMessage == "PERMISSION"){
                //     window.location.href = base_url;
                //     toastrshow("error", "Anda tidak memiliki akses", "Error");
                }else{
                    toastrshow("error", resp.message, "Error");
                }

                if(errorfunc != "") {
                    errorfunc(resp);
                }
            }

            l.ladda("stop");
        },
        error: function(xhr, textstatus, errorthrown) {
            l.ladda("stop");
            setTimeout(function(){
                toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
            }, 500);
            // console.log(xhr);
        }
    });
}

function DeleteData(selectorform, successfunc, errorfunc) {
    successfunc = (typeof successfunc !== 'undefined') ?  successfunc : "";
    errorfunc = (typeof errorfunc !== 'undefined') ?  errorfunc : "";
    var formdata   = $(selectorform).serialize() +"&act=deletedata";
    var formaction = $(selectorform).attr("action");
    $.ajax({
        type: "POST",
        url: base_url + formaction,
        data: formdata,
        dataType: "JSON",
        tryCount: 0,
        retryLimit: 3,
        beforeSend: function() {
            l.ladda("start");
        },
        success: function(resp){
            console.log(resp);
            if(resp.status) {
                toastrshow("success", "Data berhasil dihapus", "Success");
                $(selectorform).parents(".modal").modal("hide"); //Tutup modal
                if(successfunc != "") {
                    successfunc(resp);
                }
            } else {
                toastrshow("error", "Data gagal dihapus", "Peringatan");
                if(errorfunc != "") {
                    errorfunc(resp);
                }
            }

            l.ladda("stop");
        },
        error: function(xhr, textstatus, errorthrown) {
            l.ladda("stop");
            setTimeout(function(){
                $(".modal").modal("hide");
                toastrshow("warning", "Periksa koneksi internet anda kembali", "Peringatan");
            }, 500);
        }
    });
}

function GetDropdownSelect(request, target, act) {
    GetDataFull(request, act, function(resp){
        if(resp.status) {
            var rHtml = "";
            $.each(resp.data, function(index, value) {
                rHtml += '<option value="'+value.id+'">'+value.name+'</option>';
            });

            $("."+target).html(rHtml);
        }else{
            if(resp.message == "SESS_UNAUTHORIZED"){
                window.location.href = base_url + "/auth/logout.html";
                toastrshow("error", "Sesi User telah habis atau Pengguna lainnya telah login", "Error");
            }else{
                toastrshow("error", resp.message, "Error");
            }
        }
    });
}

function FrmFilter(request, target) {
    ResetRequest();
    var sort = target.find(".sort").val();
    var colspan = target.data("colspan");
    pagename = target.attr("pagename");
    var table = target.attr("class");
    table = table.replace(/flt-/g, "", table);
    targethtml = (target.data("targethtml") == undefined) ? '' : target.data("targethtml");
    request["page"] = 1;
    request["limit"] = limit;
    request["sort"] = sort;
    GetDataList(request, "listdatahtml", table, function(resp){}, colspan);
}
$("#FrmSearch").submit(function() {
    ResetRequest();
    var kywd = $(this).find("#search").val();
    request["page"] = 1;
    request["limit"] = limit;
    request["search"] = kywd;
    var colspan = $(this).data("colspan");
    pagename = $(this).attr("pagename");
    var table = $(this).attr("class");
    table = table.replace(/search-/g, "", table);
    targethtml = ($(this).data("targethtml") == undefined) ? '' : $(this).data("targethtml");
    GetDataList(request, "listdatahtml", table, function(resp){console.log(resp);}, colspan);
    return false;
});

// START PAGINATION -------------------------------------------------------------------
function pagination(page, links, table) {
    limit = page.per_page;
    var paginglayout = $(".pagination-layout-"+table);
    var infopage = page.from+" - "+page.to+ " dari "+page.total+" Data | "+page.last_page+" Halaman";
    
    paginglayout.removeClass("d-none");
    paginglayout.find("input[type='text']").val(Number(page.current_page));
    paginglayout.find("div.info").html(infopage);
    if(links.next != null) {
        paginglayout.find(".btn.next, .next-head").removeClass("disabled");
        paginglayout.find(".btn.last").removeClass("disabled");
        paginglayout.find(".btn.last").attr("lastpage", page.last_page);
        datanext = (Number(page.current_page) + 1);
    } else {
        paginglayout.find(".btn.next, .next-head").addClass("disabled");
        paginglayout.find(".btn.last").addClass("disabled");
        dataprev = 0;
    }
    if(links.prev != null) {
        paginglayout.find(".btn.prev, .prev-head").removeClass("disabled");
        paginglayout.find(".btn.first").removeClass("disabled");
        dataprev = (Number(page.current_page) - 1);
    } else {
        paginglayout.find(".btn.prev, .prev-head").addClass("disabled");
        paginglayout.find(".btn.first").addClass("disabled");
        dataprev = 0;
    }
}
$(".btn.next").on("click", function() {
    ResetRequest();
    var table = $(this).parent().parent().parent().parent().attr("class");
    var classdata = table.replace(/modal-footer set-pagination-layout-/g, "", table);
    table = table.replace(classdata, "", table);
    if(table == "modal-footer set-pagination-layout-"){
        pagename = $(this).parent().parent().parent().attr("pagename");
        request["page"] = datanext;
        request["limit"]= limit;
        GetListGroup(request, act, classdata, getfunc);
    } else {
        var colspan = $(this).parent().parent().parent().parent().attr("colspan");
        pagename = $(this).parent().parent().parent().parent().attr("pagename");
        var table = $(this).parent().parent().parent().parent().attr("class");
        table = table.replace(/pagination-layout-/g, "", table);
        request["page"] = datanext;
        request["limit"]= limit;
        GetDataList(request, act, table, getfunc, colspan);
    }
});
$(".btn.prev").on("click", function() {
    ResetRequest();
    var table = $(this).parent().parent().parent().parent().attr("class");
    var classdata = table.replace(/modal-footer set-pagination-layout-/g, "", table);
    table = table.replace(classdata, "", table);
    if(table == "modal-footer set-pagination-layout-"){
        pagename = $(this).parent().parent().parent().attr("pagename");
        request["page"] = dataprev;
        request["limit"]= limit;
        GetListGroup(request, act, classdata, getfunc, "10");
    } else {
        var colspan = $(this).parent().parent().parent().parent().data("colspan");
        pagename = $(this).parent().parent().parent().parent().attr("pagename");
        var table = $(this).parent().parent().parent().parent().attr("class");
        table = table.replace(/pagination-layout-/g, "", table);
        request["page"] = dataprev;
        request["limit"]= limit;
        GetDataList(request, act, table, getfunc, colspan);
    }
});
$(".btn.first").on("click", function() {
    ResetRequest();
    var colspan = $(this).parent().parent().parent().parent().data("colspan");
    pagename = $(this).parent().parent().parent().parent().attr("pagename");
    var table = $(this).parent().parent().parent().parent().attr("class");
    table = table.replace(/pagination-layout-/g, "", table);
    request["page"] = 1;
    request["limit"]= limit;
    GetDataList(request, act, table, getfunc, colspan);
});
$(".btn.last").on("click", function() {
    ResetRequest();
    var colspan = $(this).parent().parent().parent().parent().data("colspan");
    pagename = $(this).parent().parent().parent().parent().attr("pagename");
    var table = $(this).parent().parent().parent().parent().attr("class");
    table = table.replace(/pagination-layout-/g, "", table);
    request["page"] = $(this).attr('lastpage');
    request["limit"]= limit;
    GetDataList(request, act, table, getfunc, colspan);
});
$(".limit").on("change", function() {
    ResetRequest();
    var colspan = $(this).parent().parent().parent().parent().parent().data("colspan");
    pagename = $(this).parent().parent().parent().parent().parent().attr("pagename");
    var table = $(this).parent().parent().parent().parent().parent().attr("class");
    table = table.replace(/pagination-layout-/g, "", table);
    var limit = $(this).val();
    request["limit"]= limit;
    GetDataList(request, act, table, getfunc, colspan);
});
$("#FrmGotoPage").on("submit", function() {
    // ResetRequest();
    // var table = $(this).parent().parent().parent().attr("class");
    // table = table.replace(/pagination-layout-/g, "", table);
    // var page = $(this).find("input[type='text']").val();
    // request["Page"] = page;
    // pagename = $(this).parent().parent().parent().attr("pagename");
    // GetData(request, act, table, getfunc);
    // return false;
});

$(".btn.next-head").on("click", function() {
    // ResetRequest();
    var colspan = $(this).parent().parent().data("colspan");
    pagename = $(this).parent().parent().attr("pagename");
    var table = $(this).parent().parent().attr("class");
    table = table.replace(/pagination-layout-/g, "", table);
    request["page"] = datanext;
    request["limit"]= limit;
    GetDataList(request, act, table, getfunc, colspan);
});
$(".btn.prev-head").on("click", function() {
    // ResetRequest();
    var colspan = $(this).parent().parent().data("colspan");
    pagename = $(this).parent().parent().attr("pagename");
    var table = $(this).parent().parent().attr("class");
    table = table.replace(/pagination-layout-/g, "", table);
    request["page"] = dataprev;
    request["limit"]= limit;
    GetDataList(request, act, table, getfunc, colspan);
});
// END PAGINATION ---------------------------------------------------------------------