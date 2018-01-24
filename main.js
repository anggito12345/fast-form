/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



var appUsedCar = {
    mapList: {},
    tableList : {},    
    dependecies : [
        'libs/jqueryUI/jquery-ui.min.js',
        'js/select2.min.js',
        'js/froala_editor.min.js'
    ],
    import : function(){
        var mainObj = this;
        var getUrl = window.location;
        var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
        var defer  = $.Deferred();
        for(var i = 0; i<= this.dependecies.length - 1 ; i++){
            $.ajax({
                url : baseUrl + '/public/'+mainObj.dependecies[i],
                dataType : 'script',
                cache : true
            }).then(function(xhr){
                if(i >= mainObj.dependecies.length)
                    defer.resolve("Done")               
            },function(){
                defer.reject("Opps something wrong")
            });
        }
        return defer.promise();
    },
    imgHandler: function(){
        $("img").error(function(){
            $(this).attr("src",$("#rootFolder").val()+"/no_photo.png");
        })

        $("img").load(function(){
             $(this).attr("onclick","showFile(this)");
        })
    },
    boot : function () {
        $("[popup-anggito]").click(function(){
            if(typeof $(this).attr("popup-url") != typeof undefined){
                $.ajax({
                    url: $(this).attr("popup-url"),
                    data: typeof $(this).attr("popup-data") != typeof undefined ? JSON.parse($(this).attr("popup-data")) : ""
                }).then(function(res){
                    var matureRes = JSON.parse(res);
                    bootbox.alert(matureRes.content);
                })
            }else{

            }
        });



    },
    renderPopUpShow: function(obj) {
        var oMain = $(obj);
        var urlAPI = oMain.attr('api');
        $.ajax({
            url:urlAPI,
        }).then(function(rest){
            bootbox.alert(rest,function(callResult){

            })
        })
    },
    renderFormMulti : {
        parent : "",
        newRow : function(oParent) {
            var secObj = this;
            var jsonMentah = $(oParent).attr("form-fields");
            var oFields = JSON.parse(jsonMentah);
            var colCount = 1;
            var rowNow = $(oParent).children("[row-field]").length + 1;
            $(oParent).append("<div  class='clearfix form-group' row-field='"+rowNow+"'></div>");
            var oRow = $(oParent).children("[row-field]").last();
            var lenFields = oFields.length;
            var divCol = Math.round(12/(lenFields + 1));
            $.each(oFields,function(){
                oRow.append("<div class='col-md-"+divCol+"' col-field='"+colCount+"'></div>");
                var colConstruction = oRow.children("[col-field="+colCount+"]");
                switch(this.type){
                    case "select":
                    colConstruction.append("<label>"+this.label+"</label>");
                    colConstruction.append(secObj.makeSelect(this));
                    break;
                }
                colCount++;
                if(colCount >= lenFields){
                    //make last button
                    $(oParent).attr("id",$(oParent).attr("form-multi-creator"));
                    appUsedCar.renderSelect2();
                    $(".col-"+$(oParent).attr("form-multi-creator")).html("<div class='btn btn-danger' onclick='$(this).parent().parent().remove()'>X</div>");
                    oRow.append("<div class='col-"+$(oParent).attr("form-multi-creator")+" col-md-"+divCol+"' col-field='"+colCount+"'></div>");
                    var colConstruction = oRow.children("[col-field="+colCount+"]");
                    colConstruction.append("<div  onclick='appUsedCar.renderFormMulti.newRow($(\"[form-multi-creator="+$(oParent).attr("form-multi-creator")+"]\"))' class='btn btn-success '>Add</div>");
                }
            })
        },
        execute: function(root){
            var secObj = this;
            $("[form-multi-creator]").each(function(a,s){
                var self    = this;
                secObj.newRow(this);
            })
        },
        makeSelect: function(obj){


            var options = "";
            var hValue = "";
            //check if has default value
            if(typeof obj.value != typeof undefined){

                $.each(obj.value,function(){
                    hValue += "<option value='"+this.value+"'>"+this.label+"</option>";
                });
            }


            if(typeof obj.options != typeof undefined){
                $.each(obj.options,function(key,val){
                    options += " "+key+"="+val;
                })
            }



            return "<select name='"+obj.name+"[]' "+options+" >"+hValue+"</select>";
            //check if has any option

        }
    },

    renderDateType : function(format,obj){
        if(!obj) {
            obj = ".date"
        }

        if(!format){
            format = {
                dateFormat : "yy-mm-dd 00:00:00"
            }
        }
        $(obj).datepicker(format);
    },
    renderNumber : function(obj){
        if(!obj) {
            obj = ".number"
        }

       $(obj).number(true,0);
    },
    renderFileType : function(obj){
         if(!obj) {
            obj = "[type=file]"
        }

    },
    renderSelect2 : function(obj){

        if(!obj) {
            obj = "select"
        }

        $.each($(obj),function(i,n){
            var holderQuery = {};
            var conf = {};
            var sUrl = $(n).attr('data-url');
            var oDepends = $(n).attr('data-depends');
            conf.placeholder = "Silahkan Pilih"
            if(typeof sUrl != typeof undefined){
                conf.ajax = {
                  data:function (params) {
                    var query = {
                      search: params.term,
                      page: params.page
                    };

                    if(typeof oDepends != "undefined"){
                        var arDepends = oDepends.indexOf(',') > -1 ?  oDepends.split(',') : oDepends ;
                        if(Array.isArray(arDepends)){
                            $.each(arDepends,function(i){
                                query['search'+arDepends[i]] = $('[name='+arDepends[i]+']').val();
                            })
                        }else {
                            query['search'+arDepends] = $('[name='+arDepends+']').val();
                        }
                    }

                    holderQuery = query;
                    return query;
                  },
                  delay:250,
                  url : sUrl,
                  dataType : 'json',
                  error : function(rest){
                      console.log(rest);
                  },
                  processResults: function (data, params) {
                    var show = data.items;
                    return {
                      results:show ,
                    };
                  },
                  theme:'bootstrap',
                };

                if(typeof $(n).attr("init-val") != typeof undefined && $(n).attr("init-val") != ''){
                    if(typeof oDepends != "undefined"){
                            var arDepends = oDepends.indexOf(',') > -1 ?  oDepends.split(',') : oDepends ;
                            if(Array.isArray(arDepends)){
                                $.each(arDepends,function(i){
                                    holderQuery['search'+arDepends[i]] = $('[name='+arDepends[i]+']').attr("init-val");
                                })
                            }else {
                                holderQuery['search'+arDepends] = $('[name='+arDepends+']').attr("init-val");
                            }
                        }

                    function getDataJson(){
                        $.ajax({
                            url:sUrl,
                            data:holderQuery,
                            headers:{

                            },
                            method:"GET",

                        }).then(function(res){
                            var dataHolder = jsonSearch(JSON.parse(res)["items"],$(n).attr("init-val"),"id");
                            var $option = $("<option selected></option>").val(dataHolder['id']).text(dataHolder['text']);
                            $(n).select2(conf);
                            $(n).append($option).trigger('change');
                        },function(){
                            setTimeout(function(){
                                getDataJson();
                            },1000)
                        })
                    }

                    getDataJson();
                }else{
                    $(n).select2(conf);
                }

            }
            else{
                $(n).select2(conf);
                if(typeof $(n).attr("init-val") != typeof undefined && $(n).attr("init-val") != ''){
                    if(typeof $(n).attr('multiple') != typeof undefined){
                        $(n).val($(n).attr("init-val").split(",")).trigger('change');
                    }else{
                        $(n).val($(n).attr("init-val")).trigger('change');
                    }
                }
            }




        })

    },

    renderAutoComplete: function(){
        var acEle = $('[autocomplete]');
        $.each(acEle,function(n,c){
            $(c).autocomplete({
                source : $(c).attr('sources').split(',')
            });
        })
    },

    renderTable: function(){
        var mainObj = this;
        $.each($("[table-init]"),function(i,n){
            //create header

            var oTable = this;
            var allConf = {};
            var jsonCols = $(n).attr('table-cols');
            var sProcessing = $(n).attr('server-processing');
            var cols = $.parseJSON(jsonCols);
            $(n).append("<thead></thead>");
            var head = $(n).children("thead");
            head.append("<tr></tr>");
            var headRow = head.children("tr");
            var columns = [];
            var defer = $.Deferred();
            var prom = defer.promise();
            var num = 0;
            var dataTypeNumber = [];
            var dataCustom = [];
            var dataDecode = [];
            allConf.aaSorting = [];
            if(typeof sProcessing != typeof undefined){
                allConf.serverSide = true;
                allConf.processing = true;
            }

            allConf.buttons = [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ];
            allConf.dom = "Bfrtip";
            allConf.drawCallback = function( settings ) {
                 //mainObj.boot();
                 console.log('render table');
            }
            allConf.initComplete = function(settings,json){

            }
            $.each(cols,function(x){
              headRow.append("<td>"+cols[x].label.replaceAll("ast;","'")+"</td>");
              if(typeof cols[x].content != typeof undefined ){
                  dataCustom.push({
                      data : cols[x].data,
                      content: cols[x].content,
                      conditional : cols[x].conditional
                  });
              }

              if(typeof cols[x].decode != typeof undefined ){
                  dataDecode.push({
                      data : cols[x].data,
                  });
              }
              if(cols[x].format){
                  dataTypeNumber.push(cols[x].data);
              }
              columns.push({
                 "data" : cols[x].data,
                 "name" : cols[x].name == null ?  cols[x].data : cols[x].name
              });
              if(num >= cols.length - 1){
                  defer.resolve();
              }
              num++;
            })

            prom.then(function(){
                allConf.columns = columns;
                allConf.ajax = {};
                allConf.ajax.error = function() {
                    console.log('test');
                };
                allConf.ajax.cache = true;
                allConf.ajax.url = $(n).attr('table-ajax');
                allConf.ajax.dataSrc = function(json){
                    for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
                        $.each(dataTypeNumber,function(n){
                            json.data[i][dataTypeNumber[n]] = $.number(json.data[i][dataTypeNumber[n]],0);
                        })
                         $.each(dataDecode,function(n){
                            json.data[i][dataDecode[n].data] = $("<div/>").html(json.data[i][dataDecode[n].data]).text();
                        })
                    }
                    return json.data;
                }
                mainObj.tableList[$(n).attr('id')] =  $(n).DataTable(allConf);
                if(typeof $(oTable).attr('auto-refresh') != typeof undefined){
                    setInterval(function(){
                        mainObj.tableList[$(n).attr('id')].ajax.reload(function(){
                            appUsedCar.boot();
                        })
                    },$(oTable).attr('auto-refresh'))

                }
            })

        })
    },

    registerForm: function(obj){
        this.renderFileType();
        this.renderSelect2();
        //this.renderNumber();


        $('#'+obj.id).submit(function(event){
            event.preventDefault();
            var form = this;
            var checkLoop = 0;
            $('.number').number(true, 0, '', '');
            $.each($('.number'),function(x,v){
                if($(v).val() == ""){
                    $(v).val(0);
                }
                checkLoop++;

            })

            setTimeout( function () {
                        form.submit();
            }, 1000);

        })



        if(typeof obj.rules != typeof undefined){
            $.each(Object.keys(obj.rules),function(i,n){
                $("[name='"+n+"']").prev('label').append("<strong cladss='text-danger' style='font-size:15px'>*</strong>");
            });
        }

        //check ctrl + s binding
        if(typeof obj.shortSave != typeof undefined){
            if(obj.shortSave){
                $(document).on('keydown', function(e){

                    if(e.ctrlKey && e.which === 83){
                        e.preventDefault();
                        var theForm = $('#'+obj.id);
                        console.log(theForm.serializeJSON());
                        $.ajax({
                            url: theForm.attr('action'),
                            method: "POST",
                            data : theForm.serializeJSON()
                        }).then(function(){
                            bootbox.alert('Success');
                        },function(){
                            bootbox.alert('Error');
                        })
                    }
                });
            }
        }

    },
    registerAjaxForm: function(obj){
        this.renderFileType();
        //this.renderNumber();
        $('#'+obj.id+ " [type='submit']").click(function(event){

        })
    }
};



$(function(){
    var chk = $('[type=checkbox]');
    $.each(chk,function(i,n){
        $(n).change(function(){
            if($(n).is(':checked')){
                eval($(n).attr('if-true'))
            }else{
                eval($(n).attr('if-false'))
            }
        })        
    });
});



String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var MPK = appUsedCar.import();




