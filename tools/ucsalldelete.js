let curList = $('[data-ucs_no]').map((i, v) => $(v).attr('data-ucs_no')).get();
while (curList.length) {
    const n = curList.pop();
    $.ajax({
        type: "GET",
        url: "/piu.ucs/ucs.share/ucs.share.ajax.php",
        data: { "data_no": n, "work_type": "RemovetoUCSSLOT2" },
        cache: false,
        async: false,
        success: function (data) {
            console.log(data.unpack_data.msg);
        }
    });
}
location.reload(true);