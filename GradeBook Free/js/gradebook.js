angular.module('gradebook', [])

.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        var $scope長這個樣子 = {
            current: {
                Application: "",
                GroupID: "",
                GroupName: "",
                SelectMode: "No.",
                SelectSeatNo: "",
                Value: "",
                Student: {
                    Final: "",
                    Midterm: "89",
                    SeatNo: "5",
                    StudentName: "凱澤",
                    StudentID: "3597"
                },
                Exam: {
                    Name: 'Midterm',
                    Range: {
                        Max: 100,
                        Min: 0
                    }
                }
            },
            studentList: [
                {
                    StudentID: "3597",
                    StudentName: "凱澤",
                    SeatNo: "5",
                    Final: "",
                    Midterm: "89",
                    index: 0
                }
            ],
            examList: [
                {
                    Name: 'Midterm',
                    Type: 'Number',
                    Range: {
                        Max: 100,
                        Min: 0
                    },
                    Lock: true
                },
                {
                    Name: 'Final',
                    Type: 'Number'
                },
                {
                    Name: 'Level',
                    Type: 'Enum',
                    Option: [
                        { Label: 'A' },
                        { Label: 'B' },
                        { Label: 'C' }
                    ]
                },
                {
                    Name: 'Comment',
                    Type: 'Text'
                },
				{
				    Name: 'Avg',
				    Type: 'Function',
				    Fn: function (obj) {
				        return ((obj.Midterm || 0) + (obj.Final || 0)) / 2;
				    }
				}
            ],
            analytics: {
                Type: "Number || Enum",
                Target:{
                    Name: 'Midterm',
                    Type: 'Number'
                }
            }
        };

        $scope.showCreateModal = function (index) {
            if (index == undefined) {
                $scope.createItem = {
                    Name: '',
                    Type: 'Number',
                    Lock: false
                }
            }
            else {
                $scope.createItem = {
                    Name: '',
                    Type: 'Number',
                    Lock: false,
                    targetIndex: index
                }
                for (var k in $scope.examList[index]) {
                    if (k !== "$$hashKey") {
                        $scope.createItem[k] = $scope.examList[index][k];
                    }
                }
            }
            delete $scope.errMsg;
            $('#createModal').modal('show');

            $timeout(function () {
                $('#newColName:visible').focus().select();
            }, 200);
        }
        $scope.saveExamItem = function () {
            if ($scope.createItem.Name === '') {
                $scope.errMsg = '名稱不可空白';
                return;
            }

            var flag = false;
            angular.forEach($scope.examList, function (item, index) {
                if (item.Name === $scope.createItem.Name && index !== $scope.createItem.targetIndex)
                    flag = true; //判斷重複
            });
            if (flag) {
                $scope.errMsg = '名稱不可重複';
                return;
            }

            if ($scope.createItem.Type === 'Enum') {
                if ($scope.createItem.Option.length === 0) return;
                var temp = false;
                angular.forEach($scope.createItem.Option, function (item) {
                    if (item.Label === '')
                        temp = true;
                });

                if (temp) {
                    $scope.errMsg = '選項不可為空白';
                    return;
                }
            }
            if ($scope.createItem.targetIndex == undefined) {
                $scope.examList.push($scope.createItem);
            }
            else {
                if ($scope.examList[$scope.createItem.targetIndex].Name !== $scope.createItem.Name) {
                    $scope.studentList.forEach(function (st) {
                        st[$scope.createItem.Name] = st[$scope.examList[$scope.createItem.targetIndex].Name];
                        delete st[$scope.examList[$scope.createItem.targetIndex].Name];
                    })
                }
                $scope.examList[$scope.createItem.targetIndex] = $scope.createItem;
                delete $scope.createItem.targetIndex;
            }
            $('#createModal').modal('hide');
            var elist = [];
            $scope.examList.forEach(function (e) {
                var ex = {};
                for (var k in e) {
                    if (k !== "$$hashKey") {
                        ex[k] = e[k];
                    }
                }
                elist.push(ex);
            });
            window.localStorage[application + '/' + groupId + '/examList'] = JSON.stringify(elist);
            if ($scope.createItem.Type == "Program")
                $scope.calc();


            var ts = ($scope.current.Student || ($scope.studentList && $scope.studentList.length > 0) ? $scope.studentList[0] : null)
                , te = $scope.createItem;
            if (ts && te) {
                $scope.setCurrent(ts, te, true, true);
            }
        }

        $scope.calc = function () {
            $scope.examList.forEach(function (examItem) {
                if (examItem.Type == "Program") {
                    //eval("(function(){return 10;})")();
                    $scope.studentList.forEach(function (std) {
                        for (var i = 0; i < $scope.examList.length; i++) {
                            var e = $scope.examList[i];
                            if (e.Type !== "Program") {
                                this[e.Name] = (e.Type == "Number" ? (Number(std[e.Name]) || 0) : std[e.Name]);
                            }
                        }
                        try {
                            std[examItem.Name] = eval("(function(){return " + examItem.Fn + ";})")();;
                        }
                        catch (exc) { }
                    });
                }
            });
        }

        $scope.changeSelectMode = function (mode) {
            $scope.current.SelectMode = mode;
            $timeout(function () {
                $('#seatno-textbox:visible').select().focus();
            }, 1);
        }

        $scope.setCurrent = function (student, exam, setCondition, setFocus) {         
            $scope.current.Exam = exam;
            $scope.current.Student = student;

            if (exam) $scope.setAnalytics(exam);

            $scope.current.Value = (student || {})[exam.Name] || "";
            if (setCondition) {
                $scope.current.SelectSeatNo = student.SeatNo;
            }
            if (setFocus) {
                $timeout(function () {
                    $('#grade-textbox:visible').focus().select();
                }, 1);
            }
        }

        $scope.submitStudentNo = function (event) {
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出
            if (!$scope.current.Student) return;
            $timeout(function () {
                $('#grade-textbox:visible').focus().select();
            }, 1);
        }

        $scope.typeStudentNo = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;

            var nextStudent = null;
            var nextStudent2 = null;
            angular.forEach($scope.studentList, function (item, index) {
                if (item.SeatNo == $scope.current.SelectSeatNo) {
                    if (index > currentIndex) {
                        if (nextStudent2 == null)
                            nextStudent2 = item;
                    }
                    else {
                        if (nextStudent == null)
                            nextStudent = item;
                    }
                }
            });
            $scope.setCurrent(nextStudent2 || nextStudent, $scope.current.Exam, true, false);
        }

        $scope.goPrev = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
            $scope.setCurrent(
                (currentIndex == 0) ?
                    $scope.studentList[$scope.studentList.length - 1] :
                    $scope.studentList[currentIndex - 1]
                , $scope.current.Exam
                , true
                , true);
        }

        $scope.goNext = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
            $scope.setCurrent(
                (currentIndex == $scope.studentList.length - 1) ?
                    $scope.studentList[0] :
                    $scope.studentList[currentIndex + 1]
                , $scope.current.Exam
                , true
                , true);
        }

        $scope.enterGrade = function (event) {
            if (event.keyCode !== 13) return;
            var flag = false;
            if ($scope.current.Exam.Type == 'Number') {
                var temp = Number($scope.current.Value);
                if (temp != NaN
                    && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Max && $scope.current.Exam.Range.Max !== 0) || temp <= $scope.current.Exam.Range.Max)
                    && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Min && $scope.current.Exam.Range.Min !== 0) || temp >= $scope.current.Exam.Range.Min))
                    flag = true;
                if (flag) {
                    if ($scope.current.Value != "")
                        $scope.current.Value = temp;
                }
            }
            else {
                flag = true;
            }
            if (flag) {
                $scope.saveGrade();
            }
        }

        $scope.selectValue = function (val) {
            $scope.current.Value = val;
            $scope.saveGrade();
        }

        $scope.saveGrade = function () {
            $scope.current.Student[$scope.current.Exam.Name] = $scope.current.Value;
            $scope.calc();
            var nextStudent =
                $scope.studentList.length > ($scope.current.Student.index + 1) ?
                $scope.studentList[$scope.current.Student.index + 1] :
                $scope.studentList[0];

            $scope.setCurrent(nextStudent, $scope.current.Exam, true, false);
            $timeout(function () {
                if ($scope.current.SelectMode != 'Seq.')
                    $('#seatno-textbox:visible').select().focus();
                else {
                    $('#grade-textbox:visible').focus().select();
                }
            }, 1);

            angular.forEach($scope.studentList, function (st) {
                if (storageDataIndex[st.StudentID]) {
                    for (var key in st) {
                        if (key !== "index"
                            && key !== "SeatNo"
                            && key !== "StudentName"
                            && key !== "$$hashKey"
                            && key !== "selected"
                            )
                            storageDataIndex[st.StudentID][key] = st[key];
                    }
                }
                else {
                    storageData.push(st);
                    storageDataIndex[st.StudentID] = st;
                }
            });

            window.localStorage[application + '/' + groupId + '/studentList'] = JSON.stringify(storageData);
        }

        $scope.toggleCreateItemType = function (type) {
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

        $scope.addOptionItem = function () {
            $scope.createItem.Option.push({
                Label: ''
            });
            $timeout(function () {
                $('.pg-newoption:last-of-type').select().focus();
            }, 1);
        }

        $scope.removeOptionItem = function (index) {
            $scope.createItem.Option.splice(index, 1);
        }

        $scope.numberValue = function (examItem) {
            if (examItem.Type == 'Number') return true;
            var allNumber = true;
            $scope.studentList.forEach(function (st) {
                if (!st[examItem.Name] && !angular.isNumber(st[examItem.Name])) {
                    allNumber = false;
                }
            });
            return allNumber;
        }

        $scope.countRange = function (examItem, max, min) {
            if (!angular.isNumber(max))
                max = Number.MAX_VALUE;
            if (!angular.isNumber(min))
                min = Number.MIN_VALUE;
            var count = 0;
            $scope.studentList.forEach(function (st) {
                if (st[examItem.Name] >= min && st[examItem.Name] < max)
                    count++;
            });
            return count;
        }

        $scope.getMax = function (examItem) {
            var result = null;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name]) && (result == null || st[examItem.Name] > result)) {
                    result = st[examItem.Name];
                }
            });
            return result;
        }

        $scope.getMin = function (examItem) {
            var result = null;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name]) && (result == null || st[examItem.Name] < result)) {
                    result = st[examItem.Name];
                }
            });
            return result;
        }

        $scope.getAvg = function (examItem) {
            var powseed = 3;
            $scope.studentList.forEach(function (st) {
                try {
                    var seed = ('' + st[examItem.Name]).split('.')[1].length;
                    if (seed > powseed)
                        powseed = seed;
                }
                catch (exc) { }
            });
            powseed = Math.pow(10, powseed);
            var powsum = 0;
            var count = 0;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name]) ) {
                    powsum += st[examItem.Name] * powseed;
                    count++;
                }
            });
            if (count > 0)
                return Math.round(powsum / count) / powseed;
            else
                return null;
        }

        $scope.countValue = function (examItem, option) {
            var result = null;
            $scope.studentList.forEach(function (st) {
                if (st[examItem.Name] == option) {
                    if (result == null)
                        result = 1;
                    else
                        result++;
                }
            });
            return result;
        }

        $scope.setAnalytics = function(examItem) {
            if ($scope.numberValue(examItem)) {
                $scope.analytics = {
                    Type: "Number",
                    Target: examItem

                }
            }
            if (examItem.Type=='Enum') {
                $scope.analytics = {
                    Type: "Enum",
                    Target: examItem
                }
            }
        }

        //#region Init
        //#region 取回accessToken application groupid
        var params = location.href.substring(location.href.indexOf('#') + 1).split('&');
        var access_token = "";
        var application = "";
        var groupId = "";
        params.forEach(function (param) {
            switch (param.split('=')[0]) {
                case 'access_token':
                    access_token = param.split('=')[1];
                    break;
                case 'state':
                    var state = decodeURIComponent('' + param.split('=')[1]);
                    if (!application) application = state.split('/')[0];
                    if (!groupId) groupId = state.split('/')[1];
                    break;
            }
        });
        //#endregion

        //#region 取回studentList examList
        var storageData = [];
        if (window.localStorage[application + '/' + groupId + '/studentList']) {
            storageData = JSON.parse(window.localStorage[application + '/' + groupId + '/studentList']);
        }
        var storageDataIndex = {};
        storageData.forEach(function (sdata) {
            storageDataIndex[sdata.StudentID] = sdata;
        });
        var storageExam = [];
        if (window.localStorage[application + '/' + groupId + '/examList']) {
            storageExam = JSON.parse(window.localStorage[application + '/' + groupId + '/examList']);
        }
        //#endregion
        $.ajax({
            url: "http://dsns.1campus.net/" + application + "/sakura/GetGroupMember?stt=PassportAccessToken&AccessToken=" + access_token + "&parser=spliter&content=GroupId:" + groupId,
            crossDomain: true,
            dataType: 'xml',
            beforeSend: function (XMLHttpRequest) {
                XMLHttpRequest.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            },
            success: function (data, textStatus, XMLHttpRequest) {
                //#region 整理群組成員
                data = xml2json.parser(XMLHttpRequest.responseText);
                var slist = [];
                ([].concat(([].concat(data.Body.Group || {})[0]).Student || [])).forEach(function (st, i) {
                    var sd = {
                        StudentID: st.StudentId,
                        SeatNo: st.SeatNo,
                        StudentName: st.StudentName,
                        index: i
                    };
                    if (storageDataIndex[st.StudentId]) {
                        for (var key in storageDataIndex[st.StudentId]) {
                            if (!sd[key])
                                sd[key] = storageDataIndex[st.StudentId][key];
                        }
                    }
                    slist.push(sd);
                });
                //#endregion
                $scope.$apply(function () {
                    $scope.studentList = slist;
                    $scope.examList = storageExam;
                    $scope.current = {
                        Application: application,
                        GroupID: groupId,
                        GroupName: ([].concat(data.Body.Group || {})[0]).GroupName,
                        SelectMode: "Seq.",
                        SelectSeatNo: "",
                        Value: "",
                        Student: null,
                        Exam: null
                    };

                    var ts, te;
                    if ($scope.studentList) ts = $scope.studentList[0];
                    $scope.examList.forEach(function (e) {
                        if (!te && !e.Lock)
                            te = e;
                    });
                    if (ts && te) {
                        $scope.setCurrent(ts, te, true, true);
                    }
                    if ($scope.examList.length == 0) {
                        $scope.showCreateModal();
                    }
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            }
        });
        //#endregion

    }
]).directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});
