/** 
* 저장된 이력서 호출 
*
*/
function getResume()
{
	$.ajax({
		url : "/admin/profile",
		type : "get",
		dataType : "json",
		success : function (res) {
			/* basicinfo */
			if (res.basicinfo) {
				for (key in res.basicinfo) {
					$target = $("input[name='" + key + "']");
					if ($target.length > 0) {
						switch ($target.attr("type")) {
							case "text" : 
							case "email" :
								$target.val(res.basicinfo[key]);
								break;
							case "checkbox" :
								if (res.basicinfo[key] instanceof Array) { // 복수 checkbox
									// 취업우대, 병역 노출 
									if (res.basicinfo[key].length > 0) {
										$("section.benefit").removeClass("dn");
										$(".floating_box .benefit").prop("checked", true);
									}
								
									$.each($target, function() {
										const v = $(this).val();
										let checked = false;
										if (res.basicinfo[key].indexOf(v) != -1) {
											checked = true;
											
											if (v == '장애') {
												$(".additional_select, .additional_select .handicap").removeClass("dn");
											} else if (v == '병역') {
												$(".additional_select, .additional_select .military").removeClass("dn");
											}
										}
										
										$(this).prop("checked", checked);
									});
								} else { // 단일 checkbox 
									$target.prop("checked", res.basicinfo[key]);
								}
								break;
						}
					}
				}
			} // endif
			/* basicinfo */
			
			/** 나머지 테이블 처리 */
			for (table in res) {
				if (table == 'basicinfo') continue;
				
				let type = "";
				switch (table) {
					case "award" : 
						type = "수상";
						break;
					case "education" : 
						type = "교육";
						break;
					case "intern" : 
						type = "인턴";
						break;
					case "introduction":
						type = "자기소개";
						break;
					case "jobhistory" : 	
						type = "경력";
						break;
					case "language" :
						type = "어학";
						break;
					case "license" :
						type = "자격증";
						break;
					case "overseas" : 
						type = "해외경험";
						break;
					case "portfolio" : 
						type = "포트폴리오";
						break;
					case "school" : 
						type = "학력";
						break;
				}
				
				// $target - form_html
				$target = $("section." + table + " .form_html");
				addForm(type, $target, res[table]);
			} // endfor
			/** 나머지 테이블 처리 */
			
		},
		error : function (err) {
			console.error(err);
		}
	});
}

/**
* 템플릿 양식 추가 처리 
*
*/
function addForm(type, target, list)
{
	let template = "";
	switch (type) {
		case "학력" : 
			template = "school";
			break;
		case "경력" : 
			template = "job_history";
			break;
		case "인턴" : 
			template = "intern";
			break;
		case "교육" : 
			template = "education";
			break;
		case "자격증" : 
			template = "license"; 
			break;
		case "수상" : 
			template = "award";
			break;
		case "해외경험" : 
			template = "overseas"; 
			break;
		case "어학" : 
			template = "language";
			break;
		case "자기소개" : 
			template = "introduction";
			break;
		case "포트폴리오" :
			template = "portfolio";
			break;
	}
		
	if (template) {
		let html = $("#template_" + template).html();
					
		if (target.length > 0) {
			const no = new Date().getTime();
			html = html.replace(/<%=no%>/g, no);
		}
		
		if (list) { // 데이터가 있으면 갯수만큼 추가 
			if (list.length > 0) {
				$("section." + template).removeClass("dn");
				$(".floating_box ." + template).prop("checked", true);
			}
			
			
			list.forEach((data) => {
				// 데이터를 완성 처리 
				$tplHtml = $(html);
				const selector = ["input[type='text']", "textarea", "select"];
				selector.forEach((selector) => {
					$texts = $tplHtml.find(selector);
					$.each($texts, function() {
						const name = $(this).attr("name").toLowerCase();
						for(key in data) {
							let keyName = key.toLowerCase();
							if (keyName == 'description') keyName = 'desc';
							
							if (name.indexOf(keyName) != -1) {
								// 일치하는 name이 있는 경우 
								$(this).val(data[key]);
								
								if (selector == 'select') {
									$(this).change();
								}
								break;
							}
						}
					});
				});
				
				target.append($tplHtml);
			});
		} else { // DB 에 데이터 없는 경우는 1개만 추가 
			target.append(html);
		}
	} 
}

/**
* 선택한 메뉴에 따라 이력서 양식 항목 노출,미노출 처리
*
*/
function updateSelectedMenu()
{
	$list = $(".floating_box input[type='checkbox']");
	$.each($list, function() {
		const target = $(this).data("target");
		$target = $("section." + target);
		if ($(this).prop("checked")) {
			$target.removeClass("dn");
			
			/** 현재 영역에 추가된 입력 양식이 없으면 추가 */
			const cnt = $target.find(".rows").length;
			$form = $target.find(".add_form"); 
			if (cnt == 0 && $form.length > 0) { // 양식 추가 항목 중에서 추가된 양식이 없는 경우 자동 추가 
				const type = $form.data("type");
				$formHtml = $target.find(".form_html");
				addForm(type, $formHtml);
			}
		} else {
			$target.removeClass("dn").addClass("dn");
		}
	});
}

/**
* 스크롤시 오른쪽 floating 메뉴 고정 
*
*/
function updateNavFixed()
{
	const offset = $(".container .nav").offset();
	const ypos = offset.top + 100;
	const st = $(window).scrollTop();
	$floatingBox = $(".nav .floating_box");
	if (ypos >= st) { // fixed 제거 
		$floatingBox.removeClass("fixed");
	} else { // fixed 추가 
		$floatingBox.removeClass("fixed").addClass("fixed");
	}
}

/** 
* 취업우대,병역 항목 선택시 
* 장애, 병역 선택에 따른 항목 노출 
*
*/
function updateBenefit()
{
	$list = $(".benefit input[type='checkbox']:checked");
	let isAdditionalSelect = false;
	$(".additional_select, .additional_select dl").removeClass("dn").addClass("dn");
	$.each($list, function() {
		const benefit = $(this).val();
		if (benefit == '장애') {
			isAdditionalSelect = true;
			$(".additional_select .handicap").removeClass("dn");
		} else if (benefit == '병역') {
			isAdditionalSelect = true;
			$(".additional_select .military").removeClass("dn");
		}
	});
	
	if (isAdditionalSelect) {
		$(".additional_select").removeClass("dn");
	}
}

/**
* 프로필 사진 업로드 처리
*
* @param Boolean isSuccess - true 업로드 성공, false - 실패
*/
function uploadCallback(isSuccess) 
{
	/**
		성공 
				1. 프로필 사진 -> 사진 추가 영역에 붙여 넣고 
				2. 레이어 팝업 닫기
				
		실패 
			1. 업로드 실패 메세지 출력 후 레이어 팝업 닫기
	*/
	if (isSuccess) { // 성공 
		const tag = `<img src='/profile/profile'>`;
		$(".photo_upload").html(tag);
	} else { // 실패 
		alert("이미지 업로드 실패");
	}
	
	layer.close();
}

$(function() {
	/** 저장된 이력서 호출 */
	getResume();
	
	/** 파일 업로드 처리 */
	$("body").on("change", ".upload_box input[type='file']", function() {
		frmUpload.submit();
	});
	
	/** 주소 검색 */
	$(".search_address").click(function() {
		 new daum.Postcode({
			oncomplete: function(data) {
				$("input[name='address']").val(data.address);
			}
		}).open();
	});
	
	/** 양식 추가 처리 */
	$(".add_form").click(function() {
		const type = $(this).data("type");
		$target = $(this).closest(".form_inner").find(".form_html");
		addForm(type, $target);
	});
	
	/** 양식 제거 처리 */
	$("body").on("click", ".form_html .remove", function() {
		$(this).closest(".rows").remove();
	});
	
	
	/** textarea 확대 축소 처리 */
	$("body").on("focus", ".form_html textarea", function() {
		if (!$(this).hasClass("intro")) {
			$(this).removeClass("h200").addClass("h200");
		}
	});
	
	$("body").on("blur", ".form_html textarea", function() {
		$(this).removeClass("h200");
	});
	
	/** 취업우대, 병역 클릭 처리 */
	$(".benefit input[type='checkbox']").click(function() {
		updateBenefit();
	});
	
	/** 스크롤시 오른쪽 floating 메뉴 고정 */
	updateNavFixed();
	$(window).scroll(function() {
		updateNavFixed();
	});
	
	/** floating 메뉴 선택 처리 */
	$(".floating_box input[type='checkbox']").click(function() {
		updateSelectedMenu();
	});
	
	/** 이력서 저장하기 처리 */
	$(".floating_box .save").click(function() {
		if (confirm('정말 저장하시겠습니까?')) {
			frmProfile.submit();
		}
	});
});