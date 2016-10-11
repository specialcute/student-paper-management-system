/**
 * Created by lx on 2016/9/28.
 * 这是一个试卷模块
 */
angular.module("app.paperModule",["ng"])
    .controller("paperListController",["$scope",function ($scope) {

    }])
    .controller("paperAddController",["$scope","commentService","$routeParams","paperModel",function ($scope,commentService,$routeParams,paperModel) {
        //获取所属方向下拉框中的数据
        commentService.getAllDepartmentes(function (data) {
            $scope.departmentes = data;
        });
        //将试卷模型对象绑定到当前作用域中
        $scope.model = paperModel.model;
        var flag = $routeParams.id;
        if(flag!=0){
            paperModel.addSubjectIds(flag);
            //$routeParams是一种单例服务，为了避免每次都是拿的第一次拿的那道题，传参时进行copy，保证是本次点击添加的题
            paperModel.addSubjects(angular.copy($routeParams));


        }

    }])
    .factory("paperModel",function () {
        return {
            model:{
                dId:1,
                title:"",
                at:"",
                tt:"",
                desp:"",
                subjectIds:[],
                subjects:[],
                scores:[]
            },
            addSubjectIds:function (id) {
                this.model.subjectIds.push(id);
            },
            addSubjects:function (subject) {
                this.model.subjects.push(subject);
            },
            addScores:function(index,score){
                this.model.scores[index] = score;
            }
        }
    })