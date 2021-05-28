const { sequelize, Sequelize : { QueryTypes } } = require('./index');
/**
* 이력서 Model
*
*/
const resume = {
	/**
	* 이력서 저장 
	*
	* @param Object params - req.body
	* @return Boolean 
	*/
	update : async function(params) {
		console.log(params);
		try {
			// basicinfo 처리  S 
			
			/** 취업우대 • 병역 선택 체크 S */
			if (!params.items || params.items.indexOf("병역") == -1) {  // 취업우대,병역 항목 선택이 없으면 값 비우기
				params.military = params.handicapLevel = params.benefit = "";	
			}
			/** 취업우대 • 병역 선택 체크 E */
			
			if (params.benefit instanceof Array) {
				params.benefit = params.benefit.join("||");
			}
			
			let sql = `UPDATE basicinfo 
									SET 
										  resumeTitle = :resumeTitle, 
										  name = :name,
										  birthDate = :birthDate,
										  landline = :landline,
										  cellPhone = :cellPhone,
										  gender = :gender,
										  email = :email,
										  address = :address,
										  workType = :workType,
										  salary = :salary,
										  workLocation = :workLocation,
										  workKeyword = :workKeyword,
										  benefit = :benefit,
										  handicapLevel = :handicapLevel,
										  military = :military,
										  negotiableSalary = :negotiableSalary`;
				let replacements = {
					resumeTitle : params.resumeTitle,
					name : params.name,
					birthDate : params.birthDate,
					landline : params.landline,
					cellPhone : params.cellPhone,
					gender : params.gender,
					email : params.email,
					address : params.address,
					workType : params.workType,
					salary : params.salary,
					workLocation : params.workLocation,
					workKeyword : params.workKeyword,
					benefit : params.benefit || "",
					handicapLevel : params.handicapLevel,
					military : params.military,
					negotiableSalary : params.negotiableSalary || 0,
				};
				
				let result = await sequelize.query(sql, {
					replacements, 
					type : QueryTypes.INSERT,
				});
			// basicinfo 처리 E 
			// school 학력 처리 S 
			sql = 'TRUNCATE school';
			await sequelize.query(sql, {
				type : QueryTypes.DELETE,
			});
			
			if (params.items && params.items.indexOf('학력') != -1 && params.schoolType) {
				if (!(params.schoolType instanceof Array)) {
					params.schoolType = [params.schoolType];
					params.schoolName = [params.schoolName];
				}
				
				params.schoolType.forEach(async (type, index) => {
						name = params.schoolName[index];
						
						const sql = "INSERT INTO school (type, name) VALUES (?, ?)";
						await sequelize.query(sql, {
							replacements : [type, name],
							type : QueryTypes.INSERT,
						});
				});
			}
			// school 학력 처리 E 
			
			// jobhistory 경력 처리 S 
			sql = 'TRUNCATE jobhistory';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('경력') != -1) {
				if (!(params.jhCompany instanceof Array)) {
					params.jhCompany = [params.jhCompany];
					params.jhDept = [params.jhDept];
					params.jhStartDate = [params.jhStartDate];
					params.jhEndDate = [params.jhEndDate];
					params.jhInOffice = [params.jhInOffice];
					params.jhPosition = [params.jhPosition];
					params.jhTask = [params.jhTask];
					params.jhSalary = [params.jhSalary];
					params.jhWork = [params.jhWork];
				}
				
				params.jhCompany.forEach(async (company, index) => {
					const sql = `INSERT INTO jobhistory (company, dept, startDate, endDate, position, task, salary, work, inOffice)
										VALUES (:company, :dept, :startDate, :endDate, :position, :task, :salary, :work, :inOffice)`;
					
					const replacements = {
							company : company,
							dept : params.jhDept[index],
							startDate : params.jhStartDate[index],
							endDate : params.jhEndDate[index],
							position : params.jhPosition[index],
							task : params.jhTask[index],
							salary : params.jhSalary[index],
							work : params.jhWork[index],
							inOffice : 0,
					};
					
					await sequelize.query(sql, {
						replacements, 
						type : QueryTypes.INSERT,
					});
				});
				
			}
			// jobhistory 경력 처리 E 
			
			// intern 인턴 및 대외활동 처리 S 
			sql = 'TRUNCATE intern';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('인턴') != -1) {
				if (!(params.internType instanceof Array)) {
					params.internType = [params.internType];
					params.internCompany = [params.internCompany];
					params.internStartDate = [params.internStartDate];
					params.internEndDate = [params.internEndDate];
					params.internDesc = [params.internDesc];
				}
		
				params.internType.forEach(async (type, index) => {
					const sql = `INSERT INTO intern (type, company, startDate, endDate, description)
										VALUES (:type, :company, :startDate, :endDate, :description)`;
					
					const replacements = {
							type : type,
							company : params.internCompany[index],
							startDate : params.internStartDate[index],
							endDate : params.internEndDate[index],
							description : params.internDesc[index],
					};
					
					await sequelize.query(sql, {
						replacements, 
						type : QueryTypes.INSERT,
					});
				});
			}
			// intern 인턴 및 대외활동 처리 E
			
			// education 교육이수 처리 S 
			sql = 'TRUNCATE education';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('교육이수') != -1) {
				if (!(params.eduName instanceof Array)) {
					params.eduName = [params.eduName];
					params.eduCompany = [params.eduCompany];
					params.eduStartDate = [params.eduStartDate];
					params.eduEndDate = [params.eduEndDate];
					params.eduDesc = [params.eduDesc];
				}
				
				params.eduName.forEach(async (name, index) => {
					const sql = `INSERT INTO education (name, company, startDate, endDate, description)
											VALUES (:name, :company, :startDate, :endDate, :description)`;
					
					const replacements = {
						name : name,
						company : params.eduCompany[index],
						startDate : params.eduStartDate[index],
						endDate : params.eduEndDate[index],
						description : params.eduDesc[index],
					};
					
					await sequelize.query(sql, {
						replacements,
						type : QueryTypes.INSERT,
					});
				});
			}
			// education 교육이수 처리 E 
			
			// license 자격증 처리 S 
			sql = 'TRUNCATE license';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('자격증') != -1) {
				if (!(params.licenseName instanceof Array)) {
					params.licenseName = [params.licenseName];
					params.licenseIssue = [params.licenseIssue];
					params.licenseDate = [params.licenseDate];
				}
				
				params.licenseName.forEach(async (name, index) => {
					const sql = `INSERT INTO license (name, issue, date) 
										VALUES (:name, :issue, :date)`;
					
					const replacements = {
						name : name, 
						issue : params.licenseIssue[index],
						date : params.licenseDate[index],
					};
					
					await sequelize.query(sql, {
						replacements, 
						type : QueryTypes.INSERT,
					});
				});
			}
			// license 자격증 처리 E 
			
			// award 수상 내역 처리 S 
			sql = 'TRUNCATE award';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('수상') != -1) {
				if (!(params.awardName instanceof Array)) {
					params.awardName = [params.awardName];
					params.awardCompany = [params.awardCompany];
					params.awardYear = [params.awardYear];
					params.awardDesc = [params.awardDesc];
				}
				
				params.awardName.forEach(async (name, index) => {
					const sql = `INSERT INTO award (name, company, year, description) 
										VALUES (:name, :company, :year, :description)`;
					const replacements = {
							name : name,
							company : params.awardCompany[index],
							year : params.awardYear[index],
							description : params.awardDesc[index],
					};
					
					await sequelize.query(sql, {
						replacements,
						type : QueryTypes.INSERT,
					});
				});
			}
			// award 수상 내역 처리 E 
			
			// overseas 해외경험 처리 S 
			sql = 'TRUNCATE overseas';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('해외경험') != -1) {
	
				if (!(params.overseasName instanceof Array)) {
					params.overseasName = [params.overseasName];
					params.overseasStartDate = [params.overseasStartDate];
					params.overseasEndDate = [params.overseasEndDate];
					params.overseasDesc = [params.overseasDesc];
				}
				
				params.overseasName.forEach(async (name, index) => {
					const sql = `INSERT INTO overseas (name, startDate, endDate, description)
										VALUES (:name, :startDate, :endDate, :description)`;
				
					const replacements = {
							name : name, 
							startDate : params.overseasStartDate[index],
							endDate : params.overseasEndDate[index],
							description : params.overseasDesc[index],
					};
					
					await sequelize.query(sql, {
						replacements,
						type : QueryTypes.INSERT,
					});
				});
			}
			// overseas 해외경험 처리 E 
			
			// language 어학 처리 S 
			sql = 'TRUNCATE language';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('어학') != -1) {
				if (!(params.languageType instanceof Array)) {
					params.languageType = [params.languageType];
					params.languageName = [params.languageName];
					params.languageAbility = [params.languageAbility];
				}
				
				params.languageType.forEach(async (type, index) => {
					const sql = `INSERT INTO language (type, name, ability) 
											VALUES (:type, :name, :ability)`;
					
					const replacements = {
							type : type,
							name : params.languageName[index],
							ability : params.languageAbility[index],
					};
					
					await sequelize.query(sql, {
						replacements,
						type : QueryTypes.INSERT,
					});
				});
			}
			// language 어학 처리 E 
			
			// portfolio 처리 S
			sql = "TRUNCATE portfolio";
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('포트폴리오') != -1) {
				if (!(params.portfolioTitle instanceof Array)) {
					params.portfolioTitle = [params.portfolioTitle];
					params.portfolioUrl = [params.portfolioUrl];
					params.portfolioDesc = [params.portfolioDesc];
				}
				
				params.portfolioTitle.forEach(async (title, index) => {
					const sql = `INSERT INTO portfolio (title, url, description) 
											VALUES (:title, :url, :description)`;
					
					const replacements = {
							title : title,
							url : params.portfolioUrl[index],
							description : params.portfolioDesc[index],
					};
					
					await sequelize.query(sql, {
						replacements,
						type : QueryTypes.INSERT,
					});
				});
			}
			// portfolio 처리 E 
			
			// introduction 자기소개 S 
			sql = 'TRUNCATE introduction';
			await sequelize.query(sql, { type : QueryTypes.DELETE });
			if (params.items && params.items.indexOf('자기소개') != -1) {
				if (!(params.introductionTitle instanceof Array)) {
					params.introductionTitle = [params.introductionTitle];
					params.introduction = [params.introduction];
				}
				
				params.introductionTitle.forEach(async (title, index) => {
					const sql = 'INSERT INTO introduction (title, introduction) VALUES (:title, :introduction)';
					const replacements = {
							title : title,
							introduction : params.introduction[index],
					};
					
					await sequelize.query(sql, {
						replacements,
						type : QueryTypes.INSERT,
					});
				});
			}
			// introduction 자기소개 E 
			
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	},
	/**
	* 저장된 이력서 데이터
	*
	*/
	get : async function() {
		const tables = [
			'basicinfo',
			'award',
			'education',
			'intern',
			'introduction',
			'jobhistory',
			'language',
			'license',
			'overseas',
			'portfolio',
		];
		
		const data = {};
		try {
			for (let i = 0; i < tables.length; i++) {
				table = tables[i];
				let sql = "SELECT * FROM :" + table;
				if (table != 'basicinfo') {
					sql += "ORDER BY idx";
				}
				
				const rows = await sequelize.query(sql, {
					type : QueryTypes.SELECT,
				});
				
				if (table == 'basicinfo') { // 기본 인적사항 -> 레코드 1개
					data[table] = rows[0];
					data[table].benefit = data[table].benefit?data[table].benefit.split("||"):[];
			
				} else { // 나머지는 레코드 여러개
					data[table] = rows;
				}
			}
		} catch (err) {
			return {};
		}
		console.log(data);
		return data;
	},
};

module.exports = resume;