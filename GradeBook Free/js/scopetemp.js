angular.module('entergrade', [])

.controller('MainCtrl', ['$scope',
    function($scope) {
        $scope.viewType = 'ExamList';
        $scope.inputScore = false;

        $scope.getExamList = function() {
            if (window.localStorage['examList']) {
                $scope.examList = JSON.parse(window.localStorage['examList']);
            } else {
                $scope.examList = [{
                    Name: '文字類型',
                    Type: 'Text',
                    Lock: true
                }, {
                    Name: '數字類型',
                    Type: 'Number',
                    Range: {
                        Max: 100,
                        Min: 0
                    },
                    Lock: false
                }, {
                    Name: '選單類型',
                    Type: 'Enum',
                    Option: [{
                        Label: 'A'
                    }, {
                        Label: 'B'
                    }, {
                        Label: 'C'
                    }],
                    Lock: false
                }];
            }
        }

        $scope.selectExam = function(item) {
            $scope.currentExam = item;
            $scope.inputScore = true;

            angular.forEach($scope.studentList, function(stu) {
                stu['edit_' + item.Name] = stu[item.Name];
            });
        }

        $scope.removeExam = function(index) {
            if (!confirm("是否刪除？")) return;

            $scope.examList.splice(index, 1);
            $scope.saveExamListToLocalStorge();
        }

        $scope.lockExam = function(item) {
            item.Lock = !item.Lock;

            $scope.saveExamListToLocalStorge();
        }

        $scope.saveStuExam = function() {
            console.log($scope.studentList);

            var storage = [];
            angular.forEach($scope.studentList, function(stu) {
                var temp = {
                    StudentID: stu.StudentID,
                    SeatNo: stu.SeatNo,
                    StudentName: stu.StudentName
                };

                angular.forEach($scope.examList, function(exam) {
                    temp[exam.Name] = stu['edit_' + exam.Name];
                });

                storage.push(temp);
            });

            window.localStorage['studentList'] = JSON.stringify(storage);
            delete $scope.currentExam;
            $scope.inputScore = false;
        }

        $scope.getStudentList = function() {
            if (window.localStorage['studentList']) {
                $scope.studentList = JSON.parse(window.localStorage['studentList']);
            } else {
                $scope.studentList = [{
                    StudentID: 238001,
                    SeatNo: '1',
                    StudentName: '郭承瑾'
                }, {
                    StudentID: 238002,
                    SeatNo: '2',
                    StudentName: '徐舶元'
                }, {
                    StudentID: 238003,
                    SeatNo: '3',
                    StudentName: '姚佳妤'
                }];
            }
        }

        $scope.showCreateModal = function() {
            $scope.createItem = {
                Name: '',
                Type: 'Text',
                Lock: false
            }

            $('#createModal').modal('show');
            delete $scope.errMsg;
        }

        $scope.toggleCreateItemType = function(type) {
            $scope.createItem.Type = type;
            if (type === 'Number') {
                $scope.createItem.Range = {
                    Max: '100',
                    Min: '0'
                }
            } else if (type === 'Enum') {
                $scope.createItem.Option = [{
                    Label: 'A'
                }, {
                    Label: 'B'
                }, {
                    Label: 'C'
                }];
            }
        }

        $scope.addOptionItem = function() {
            $scope.createItem.Option.push({
                Label: ''
            });
        }

        $scope.removeOptionItem = function(index) {
            $scope.createItem.Option.splice(index, 1);
        }

        $scope.saveExamItem = function() {
            if ($scope.createItem.Name === '') {
                $scope.errMsg = '標題不可空白';

                return;
            }

            var flag = false;
            angular.forEach($scope.examList, function(item) {
                if (item.Name === $scope.createItem.Name)
                    flag = true; //判斷重複
            });

            if (flag) {
                $scope.errMsg = '標題不可重複';

                return;
            }

            if ($scope.createItem.Type === 'Enum') {
                if ($scope.createItem.Option.length === 0) return;
                var temp = false;
                angular.forEach($scope.createItem.Option, function(item) {
                    if (item.Label === '')
                        temp = true;
                });

                if (temp) {
                    $scope.errMsg = '選項不可為空白';

                    return;
                }
            }

            $scope.examList.push($scope.createItem);
            $('#createModal').modal('hide');

            $scope.saveExamListToLocalStorge();
        }

        $scope.saveExamListToLocalStorge = function() {
            var storage = [];
            angular.forEach($scope.examList, function(item) {
                if (item.Type === 'Text') {
                    storage.push({
                        Name: item.Name,
                        Type: item.Type,
                        Lock: item.Lock
                    });
                } else if (item.Type === 'Number') {
                    storage.push({
                        Name: item.Name,
                        Type: item.Type,
                        Range: {
                            Max: item.Range.Max,
                            Min: item.Range.Min
                        },
                        Lock: item.Lock
                    });
                } else if (item.Type === 'Enum') {
                    var option = [];

                    angular.forEach(item.Option, function(temp) {
                        if (temp.Label !== '')
                            option.push({
                                Label: temp.Label
                            });
                    });

                    storage.push({
                        Name: item.Name,
                        Type: item.Type,
                        Option: option,
                        Lock: item.Lock
                    });
                }
            });

            window.localStorage['examList'] = JSON.stringify(storage);
        }

        $scope.getExamList();
        $scope.getStudentList();
    }
]);
