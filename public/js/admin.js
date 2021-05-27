/**
* 템플릿 양식 추가 처리 
*
*/
function addForm(type, target)
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
			
		target.append(html);
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