var searchUrl = DISC.API.URL + '/api/di/roleStatusConfig/getRoleStateConfs'; //查询表格
var tableColums, confConstId;
var operStateId = '',
	operTypeId = '',
	operLevelId = '',
	roleCode = '',
	roleName = "全部";
window.pageLoadMode = PageLoadMode.None;
$(function() {
	var page = {
		/**
		 * 初始化
		 */
		init: function() {
			//绑定事件
			this.bindUI();
			page.logic.selectData(roleURL, 'roleName', 'roleNameBox', '', true);
			//初始化表格
			page.logic.initTable();
			//指令状态
			page.logic.getAllOperStates();
			// 获取底部报警数据
			alertMessage();
		},
		/**
		 * 绑定事件
		 */
		bindUI: function() {

		},
		data: {
			// 设置查询参数
			param: {}
		},
		/**
		 * 方法
		 */
		logic: {
			/**
			 * 搜索
			 */
			search: function() {
				getUserCode(function(userCode) {
					page.data.param = DISC.form.getData("searchForm");
					$("#table").bootstrapTable('refresh', {
						"url": searchUrl + "?userCode=" + userCode + '&roleCode=' + roleCode + '&roleName=' + roleName + "&operStateId=" + operStateId + "&operLevelId=" + operLevelId + "&operTypeId=" + operTypeId,
						"pageNumber": 1
					});
				})
			},
			/**
			 * 初始化表格
			 */
			initTable: function(data) {
				getUserCode(function(userCode) {
					$("#table").bootstrapTable({
						striped: false, //是否显示行间隔色
						pagination: true, //是否显示分页（*）
						pageNumber: 1, //初始化加载第一页，默认第一页
						pageSize: 10, //每页的记录行数（*）
						pageList: [5, 10, 20, 30, 50], //可供选择的每页的行数（*）
						sidePagination: "client", // 表示服务端请求 后台分页 server
						queryParams: page.logic.queryParams,
						cache: false,
						dataType: "json",
						contentType: 'application/json',
						"url": searchUrl + "?userCode=" + userCode + '&roleCode=' + roleCode + '&roleName=' + roleName + "&operStateId=" + operStateId + "&operLevelId=" + operLevelId + "&operTypeId=" + operTypeId,
						responseHandler: function(res) {
							var res = $.ET.toObjectArr(res);
							$('#tale').bootstrapTable('getOptions').data = res;
							return res;
						},
						columns: [{
							field: 'commandTypeName',
							title: '角色',
							align: 'left',
							width: '100px'
						}, {
							field: 'operStateName',
							title: '指令状态',
							align: 'left',
							width: '100px'
						}, {
							field: 'operTypeName',
							title: '状态类型',
							align: 'left',
							width: '100px',
						}, {
							field: 'operLevelName',
							title: '状态级别',
							align: 'left',
							width: '100px',
						}, {
							title: '操作',
							align: 'left',
							width: '100px',
							formatter: page.logic.onActionRenderer
						}],
						onLoadSuccess: function(data) {
							//设置鼠标浮动提示
							var tds = $('#table').find('tbody tr td');
							$.each(tds, function(i, el) {
								$(this).attr("title", $(this).text())
							});
							customScroll({
								target: $('.tab-content'),
								width: '100%',
								height: '100%',
								tableHeight: $('.tab-content').find('.bootstrap-table').height()

							});
							var tableColums = $('#table').bootstrapTable('getOptions').columns[0];
							fixdTableHeader($('.table-header'), tableColums, $('.table-content'));
						}

					})
				})

			},
			/**
			 * 添加配置行按钮操作
			 * @returns {*[]}
			 */
			onActionRenderer: function() {
				rowData = arguments[1];
				return [
					'<div class="box-edit">' +
					"<a title='编辑' class=\"edit-style\" href='javascript:window.page.logic.edit(" + JSON.stringify(rowData) +
					")'>" + '<img src="../../../images/common/icon-edits.png"></a> &nbsp;' +
					'<a title="删除" class="edit-style" href="javascript:window.page.logic.delSingle(\'' + rowData.confConstId +
					'\')" ><img src="../../../images/common/icon-delrun.png"></a></div>'
				]
			},
			/**
			 * 查询参数
			 * @param params
			 * @returns {{pageSize: *, pageNumber: *}}
			 */
			queryParams: function(p) { // 设置查询参数
				var param = {
					pageSize: p.pageSize,
					pageNumber: p.pageNumber,
					sortOrder: p.sortOrder
				};
				return $.extend(page.data.param, param);
			},

			/*
			 *下拉框数据
			 */
			selectData: function(selectAPI, inputId, boxId, param) {
				getUserCode(function(userCode) {
					$.ajax({
						url: selectAPI + '?userCode=' + userCode,
						type: "get",
						async: true,
						cache: false,
						data: param,
						dataType: "json",
						success: function(result) {
							var data = $.ET.toObjectArr(result);
							data.unshift({
								roleCode: '',
								roleName: '全部'
							})
							var len = data.length;
							var exp = "";
							var str = "";
							if(data != [] || data != null || data.length != 0) {
								//var array = new Array();

								for(var i = 0; i < len; i++) {
									var useName = data[i].roleName;
									var useCode = data[i].roleCode;
									str += useCode + ',';
									exp += '<div class="option-list" data-code="' +
										useCode +
										'" data-id="' +
										inputId +
										'" data-name="' +
										useName +
										'">' +
										useName +
										'</div>'
								}
								$('#' + boxId).html(exp);
								$('#' + inputId).val(len > 1 ? '全部' : useName);
								$('#' + inputId).attr("data-code", len > 1 ? "" : useCode);
							}
						}
					})
				})
			},

			/*
			 *指令状态
			 */
			getAllOperStates: function() {
				$(".selectpicker").selectpicker({
					noneSelectedText: '全部' //默认显示内容  
				});
				getUserCode(function(userCode) {
					$.ajax({
						url: InstructionStatusUrl + '?userCode=' + userCode,
						type: "get",
						async: true,
						cache: false,
						// data: param,
						dataType: "json",
						success: function(result) {
							var data = $.ET.toObjectArr(result);
							data.unshift({
								operStateId: '',
								operStateName: '全部'
							})
							var str = "";
							for(var i = 0; i < data.length; i++) {
								str += "<option value='" + data[i].operStateId + "' data-id='" + data[i].operStateId + "'>" + data[i].operStateName +
									"</option>"
							}
							customScroll({
								target: $('.selectpicker'),
								width: '100%',
								height: '100%',
								tableHeight: $('.selectpicker').height()
							});
							var operStateId = '';
							if(data.length) {
								operStateId = data[0].operStateId;
							}
							$(".selectpicker").html(str).selectpicker('refresh');
							$('.selectpicker').html(str).selectpicker('val', operStateId);

						}
					})
				})
			},
			/**
			 * 单条删除
			 */
			delSingle: function(confConstId) {
				console.log(confConstId);
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function() {
					$.ajax({
						url: delUrl + '?id=' + confConstId,
						async: false,
						dataType: "text",
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function(result) {
							console.log('成功', result);
							if(result.indexOf('collection') < 0) {
								layer.msg("删除成功")
								page.logic.search();
							} else {
								result = JSON.parse(result)
								layer.msg(result.collection.error.message)
							}
						},
						error: function(result) {
							console.log('失败', result);
							var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);
						}
					})
				}, function(index) {
					layer.close(index);
				});
			},
			/**
			 * 新增
			 */
			add: function() {
				var pageMode = PageModelEnum.NewAdd;
				var title = "角色状态配置新增";
				page.logic.detail(title, "", pageMode);
			},
			/**
			 * 编辑
			 * @param warnAlarmMessConf
			 */
			edit: function(warnAlarmMessConf) {
				var pageMode = PageModelEnum.Edit;
				var title = "角色状态配置编辑";
				page.logic.detail(title, warnAlarmMessConf, pageMode);
			},
			/**
			 * 装置新增或者编辑详细页面
			 */
			detail: function(title, warnAlarmMessConf, pageMode) {
				layer.open({
					type: 2,
					title: title,
					closeBtn: 1,
					area: ['750px', '350px'],
					shadeClose: false,
					content: 'RoleStatusConfigAddOrEdit.html',
					success: function(layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							"warnAlarmMessConf": warnAlarmMessConf,
							'title': title
						};
						iframeWin.page.logic.setData(data);
					},
					end: function() {
						if(window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search(); //关闭并刷新
							window.pageLoadMode = PageLoadMode.None;
						} else if(window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search(); //关闭并刷新
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				})
			},

		}
	}
	page.init();
	window.page = page;
})