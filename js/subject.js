/**
 * Created by lichunyu on 16/9/22.
 *
 * 题库模块
 */
angular.module("app.subjectModule",["ng"])
    .controller("subjectCheckController",["$scope","$location","subjectService","$routeParams",function ($scope,$location,subjectService,$routeParams) {
        subjectService.checkSubject($routeParams.id,$routeParams.state,function (data) {
            alert(data);
            $routeParams.state
        })
        $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
    }])
    .controller("subjectDelController",["$scope","$location","subjectService","$routeParams",function ($scope,$location,subjectService,$routeParams) {
        var flag = confirm("确认删除吗");
        if(flag){
            //调用删除方法
            subjectService.delSubject($routeParams.id,function (data) {
                alert(data);
            })
        };
        $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
    } ])
    //控制器
    .controller("subjectController", ["$scope","commentService","subjectService","$filter","$routeParams","$location",
        function ($scope,commentService,subjectService,$filter,$routeParams,$location) {
            $scope.key = "stem";
            $scope.value = "";


            //调用服务方法加载题目属性信息，并且进行绑定
            $scope.params = $routeParams;
            $scope.isShow = true;

            //封装筛选数据时用的模板对象
            var subjectModel =(function () {
                var obj = {};
                if($routeParams.typeId!=0){
                    obj['subject.subjectType.id'] = $routeParams.typeId;
                }
                if($routeParams.dpId!=0){
                    obj['subject.department.id'] = $routeParams.dpId;
                }
                if($routeParams.topicId!=0){
                    obj['subject.topic.id'] = $routeParams.topicId;
                }
                if($routeParams.levelId!=0){
                    obj['subject.subjectLevel.id'] = $routeParams.levelId;
                }
                return obj;
            })();

            //添加页面中的默认数据
            $scope.model = {
                typeId:1,
                departmentId:1,
                levelId:1,
                topicId:1,
                stem:"",
                answer:"",
                analysis:"",
                choiceContent:[],
                choiceCorrect:[false,false,false,false]
            };

            //给保存并继续按钮绑定saveSubject()方法
          $scope.saveSubject = function () {
            subjectService.saveSubject($scope.model,function (data) {
                alert("保存成功");
            });
              //保存完后进行重置
              var model = {
                  typeId:1,
                  departmentId:1,
                  levelId:1,
                  topicId:1,
                  stem:"",
                  answer:"",
                  analysis:"",
                  choiceContent:[],
                  choiceCorrect:[false,false,false,false]
              };
              //改变作用域中的值
              angular.copy(model,$scope.model);
          };
          //给保存并关闭按钮绑定saveClose()方法
            $scope.saveClose =function () {
                subjectService.saveSubject($scope.model,function (data) {
                        alert("保存成功");
                });
                $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
            };


            //服务调用
            commentService.getAllType(function (data) {
                $scope.types = data;
            });
            commentService.getAllLevels(function (data) {
                $scope.levels = data;
            });
            commentService.getAllDepartmentes(function (data) {
                $scope.departmentes = data;
            });
            commentService.getAllTopics(function (data) {
                $scope.topics = data;
            });
            //调用subjectService获取所有题目信息
            subjectService.getAllSubjects(subjectModel,function (data) {
                //遍历所有的题目，计算出选择题的答案，并且将答案赋给subject.answer
                data.forEach(function (subject) {
                    //获取正确答案
                    if(subject.subjectType && subject.subjectType.id != 3){
                        var answer = [];
                        subject.choices.forEach(function (choice,index) {
                            if(choice.correct){
                                //将索引转换为A/B/C/D
                                var no = $filter('indexToNo')(index);
                                answer.push(no);
                            }
                        });
                        //将计算出来的正确答案赋给subject.answer
                        subject.answer = answer.toString();
                    }

                });
                $scope.subjects = data;
            });

    }])
    //题目服务，封装操作题目的函数
    .service("subjectService",["$http","$httpParamSerializer",function ($http,$httpParamSerializer) {
        this.getAllSubjects = function (params,handler) {
            $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjects.action",{
               params:params
            }).success(function (data) {
           // $http.get("data/subjects.json").success(function (data) {
                handler(data);
            });
        };
        this.saveSubject = function (params,handler) {
            //进行数据转换
            var obj = {};
            for(var key in params){
                var val = params[key];
                switch (key){
                    case 'typeId':
                        obj['subject.subjectType.id'] = val;
                        break;
                    case 'departmentId':
                        obj['subject.department.id'] = val;
                        break;
                    case 'levelId':
                        obj['subject.subjectLevel.id'] = val;
                        break;
                    case 'topicId':
                        obj['subject.topic.id'] = val;
                        break;
                    case 'stem':
                        obj['subject.stem'] = val;
                        break;
                    case 'answer':
                        obj['subject.answer'] = val;
                        break;
                    case 'analysis':
                        obj['subject.analysis'] = val;
                        break;
                    case 'choiceContent':
                        obj['choiceContent'] = val;
                        break;
                    case 'choiceCorrect':
                        obj['choiceCorrect'] = val;
                        break;
                };
            };
            console.log(obj);
            //将数据转换为form表单格式
            obj = $httpParamSerializer(obj);
            $http.post("http://172.16.0.5:7777/test/exam/manager/saveSubject.action",obj,{
                headers:{
                    "content-Type":"application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                handler(data);
            })
        };
        //
        this.delSubject = function (id,handler) {
            $http.get("http://172.16.0.5:7777/test/exam/manager/delSubject.action",{
                params:{
                    'subject.id':id
                }
            }).success(function (data) {
                handler(data);
            })
        };
        this.checkSubject = function (id,state,handler) {
            $http.get("http://172.16.0.5:7777/test/exam/manager/checkSubject.action",{
                params:{
                    'subject.id':id,
                    'subject.checkState':state
                }
            }).success(function (data) {
                handler(data);
            })
        };

    }])
    //公共服务 用于获取题目相关信息
    .factory("commentService",["$http",function ($http) {
        return {
            getAllType:function(handler){
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectType.action").success(function (data) {
                //$http.get("data/types.json").success(function (data) {
                    handler(data);
                });
            },
            getAllLevels:function (handler) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectLevel.action").success(function (data) {
                //$http.get("data/levels.json").success(function (data) {
                    handler(data);
                });
            },
            getAllDepartmentes:function (handler) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllDepartmentes.action").success(function (data) {
                //$http.get("data/departmentes.json").success(function (data) {
                    handler(data);
                });
            },
            getAllTopics:function (handler) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllTopics.action").success(function (data) {
                //$http.get("data/topics.json").success(function (data) {
                    handler(data);
                });
            }
        }
    }])
    //过滤器
    .filter("indexToNo",function () {
        return function (input) {
            var result ;
            switch (input){
                case 0:
                    result = 'A';
                    break;
                case 1:
                    result = 'B';
                    break;
                case 2:
                    result = 'C';
                    break;
                case 3:
                    result = 'D';
                    break;
                case 4:
                    result = 'E';
                    break;
                default:
                    result = 'F';
            }
            return result;
        }
    })
    //自定义过滤器，根据方向的id加载所对应的知识点
    .filter("selectTopic",function () {
        return function (input,id) {
            if(input){
              return  input.filter(function (item) {
                  return  item.department.id == id;
               })
            }
        }
    })
    .directive("selectOption",function () {
        //自定义指令取得每个选项的value值，并将value值映射到choiceCorrect[]中
        return {
            restrict:"A",
            link:function (scope,element,attrs) {
                element.on("change",function () {
                    var type = element.attr("type");
                    var isCheck = angular.element(this).prop("checked");
                    if(type=="radio"){
                        scope.model.choiceCorrect = [false,false,false,false];
                        var index = angular.element(this).val();
                        scope.model.choiceCorrect[index] = true ;
                    }else if(type=="checkbox"&&isCheck){
                        var index = angular.element(this).val();
                        scope.model.choiceCorrect[index] = true ;
                    }else{
                        var index = angular.element(this).val();
                        scope.model.choiceCorrect[index] = false ;
                    }
                    scope.$digest();
                })

            }
        }
    })
    //当选择的题型改变时，用自定义指令重置每个选项的布尔值。
    .directive("changeReset",function () {
        return {
            restrict:"A",
            link:function (scope,element,attrs) {
                element.on("change",function () {
                    scope.model.choiceCorrect = [false,false,false,false];
                    //强制将改变的值映射到$scope中
                    scope.$digest();
                })
            }
        }
    });
