/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['knockout', 'ojs/ojmodel', 'ojs/ojknockouttemplateutils', 'ojs/DemoDelayingDataProvider',
        "ojs/ojarraydataprovider", 'ojs/ojcollectiondatagriddatasource', 'ojs/ojdatagrid', "ojs/ojbutton", 
        "ojs/ojselectsingle", "ojs/ojlistview", "ojs/ojhighlighttext", 'ojs/ojinputtext', 
        "ojs/ojdatetimepicker", "ojs/ojlistitemlayout", "ojs/ojavatar"], 
    
function (ko, Model, KnockoutTemplateUtils, DemoDelayingDataProvider, ArrayDataProvider, collectionModule) {
    
    
    var rootViewModel = ko.dataFor(document.getElementById('globalBody'));

    // Create a child router with one default path
    this.childRouter = rootViewModel.router.createChildRouter([
        { path: 'payments' },
    ]);   
    
    /**
     * The view model for the main content view template
     */        
    function feesViewModel(params) {
        
        var self = this;                   
        
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                
        
        self.isAdmin = ko.observable(rootViewModel.isAdmin());
        
        self.baseUrl = rootViewModel.assistanceServiceBaseUrl();                
        
        self.pivoted = ko.observable(false);
        
        self.KnockoutTemplateUtils = KnockoutTemplateUtils;   

        self.dataSource = ko.observable();

        self.data = ko.observableArray();

        self.subjects = ko.observableArray();

        self.rooms = ko.observableArray();

        self.teacher = ko.observable();

        self.teachers = ko.observable();

        self.subject = ko.observable();

        self.room = ko.observable();

        self.day = ko.observable();

        self.begin = ko.observable();

        self.end = ko.observable();

        self.schedule = ko.observable();

        self.isNew = ko.observable(true);

        self.firstSelectedItem = ko.observable();

        self.subjects = ko.computed(function () {

            var subjects = [];               
                    
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "subjects").
                then(function (data) {                       
                  
                  data.forEach(subject => {
                      r = {};
                      r.label = subject.name;
                      r.value = subject.id;
                      r.subject = subject;
                      subjects.push(r)
                  });                                                      
                                      
            });                                           
    
            return new ArrayDataProvider(
                subjects,
                {keyAttributes: 'value'}
            );                

        });


        self.fetchRooms = function () { 
                                    
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "rooms/" + self.begin() + "/" + self.end())
                .done(function (data) {   

                    var rooms = [];
                                        
                    r = {};
                    r.label = "";
                    r.value = 0;
                    //rooms.push(r);                    

                    data.forEach(room => {
                        r = {};
                        r.label = room.code + " - " + room.name;
                        r.value = room.id;
                        r.room = room;                        
                        rooms.push(r);
                    });                                          
        
                    // Crear ArrayDataProvider con los datos
                    var arrayDataProvider = new ArrayDataProvider(rooms, { keyAttributes: 'value' });
        
                    // Crear DemoDelayingDataProvider
                    var delayingDataProvider = new DemoDelayingDataProvider(arrayDataProvider); // 1000 ms de retraso
        
                    // Actualizar el observable con el DemoDelayingDataProvider
                    self.rooms(delayingDataProvider);                    
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error('Error al obtener datos:', textStatus, errorThrown);
                });
        };

        self.begins = ko.computed(function () {

            var begins = [];                 
                    
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "schedConfigs").
                then(function (data) {                       
                  
                  data.forEach(schedConfig => {
                      r = {};
                      r.label = schedConfig.begin;
                      r.value = schedConfig.id;
                      r.begin = schedConfig;
                      begins.push(r);
                  });                                      
                                      
            });                                           
    
            return new ArrayDataProvider(
                begins,
                {keyAttributes: "value"}
            );           

        });

        self.ends = ko.computed(function () {

            var ends = [];               
                    
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "schedConfigs").
                then(function (data) {                       
                  
                  data.forEach(schedConfig => {
                      r = {};
                      r.label = schedConfig.end;
                      r.value = schedConfig.id;
                      r.end = schedConfig;
                      ends.push(r)
                  });                                                      
                                      
            });                                           
    
            return new ArrayDataProvider(
                ends,
                {keyAttributes: "value"}
            );                

        });

        self.teachers = ko.computed(function () {
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "teachers").
                then(function (teachers) {                                        
                    self.data(teachers);                                        
            });                                  
                       
            return new ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            ); 

        });

        this.getItemText = (itemContext) => {
            return `${itemContext.data.firstName} ${itemContext.data.lastName}`;
        };
                                   
        
        self.fetchSchedules = function () {
            
            //console.log(JSON.stringify(params));            

            if (typeof self.teacher() === 'undefined') {
                return;
            }  
            
            
            // List View Collection and Model 
            var categoryModelItem = oj.Model.extend({
                idAttribute: 'id'
            });                   
            
            var collection = new Model.Collection(null, {
                url: self.baseUrl + "schedules/teacher/" + self.teacher()
            });
            
            console.log(collection);

            self.dataSource(new collectionModule.CollectionDataGridDataSource(collection,
                { rowHeader: 'schedule' }
            ));
        };

        self.fetchSchedules();


        self.columnHeaderRenderer = function (headerContext) {          
            console.log(JSON.stringify(headerContext.keys()));
            var column;
            $(headerContext.keys).each(function(k, v) {
                console.log(JSON.stringify(v["column"]));
                column = v["column"];
                return false;
            });  
            return {insert: column};
        };

        self.setCellStyleClass = function (cellContext) {
            var row = cellContext.indexes.row;
            if ((row + 1) % 5 === 0) {
              return 'demo-cell-total oj-helper-justify-content-right';
            }
            return 'oj-helper-justify-content-right';
        };
            
            
        self.getCellClassName = function (cellContext) {                        
            if(cellContext.data.payment > 0) {
                return 'highlight-cell';                        
            }
            else {
                return 'oj-helper-justify-content-center';                        
            }            
        };  

    
        
        self.createSchedule = function (event, data) {
                                                                                                                                                    
        
            let subject = document.getElementById("subjects");
            let room = document.getElementById("rooms"); 
        
                                                           
            subject.validate().then((result3) => {                
                room.validate().then((result4) => { 
    
                    if(result3 === 'invalid' || result4 === 'invalid') {
                        return false;
                    }
                    
                    var schedule = {};
    
                    schedule.day = self.schedule().day;
                    schedule.begin = self.schedule().begin;
                    schedule.end = self.schedule().end;
                    schedule.subject = self.getSubjectById(self.subject());
                    schedule.room = self.getRoomById(self.room());   
                    schedule.teacher = self.getTeacherById(self.teacher());                       
    
                    console.log(JSON.stringify(schedule));
                    
                    $.ajax({                    
                        type: "POST",
                        url: ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "schedules/save",                                        
                        dataType: "json",      
                        data: JSON.stringify(schedule),			  		 
                        //crossDomain: true,
                        contentType : "application/json",                    
                        success: function() {                                        
                            var msg = "Record has been succesfuly saved";
                            ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Saved', detail: msg, autoTimeout: 5000}]);
                            document.getElementById("dialog1").close();   
                            
                            self.fetchSchedules();
                                                            
                            self.begin(null);
                            self.end(null);
                            self.subject(null);
                            self.room(null);
                        },
                        error: function (request, status, error) {                                                                            
                        },                                  
                    });

                });
            });                                                      
        } 
        
        self.deleteSchedule = () => {                    
            
            var id = self.schedule().id;
                             
            $.ajax({                    
              type: "DELETE",
              url: ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "schedules/delete/" + id,                                        
              //dataType: "json",                    
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                                        
                    var msg = "Record has been succesfuly deleted";
                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Deleted', detail: msg, autoTimeout: 5000}]);
                    document.getElementById("dialog1").close();   
                    
                    self.fetchSchedules();
                                                    
                    self.begin(null);
                    self.end(null);
                    self.subject(null);
                    self.room(null);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });                                                                           
        };

        self.createEvents = () => {   
            
            alert(JSON.stringify(self.teacher()));
            
            var id = self.teacher();
                             
            $.ajax({                    
              type: "PUT",
              url: ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "events/teacher/" + id,                                        
              //dataType: "json",                    
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                                        
                    var msg = "Events have been succesfuly created";
                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Created', detail: msg, autoTimeout: 5000}]);
                    document.getElementById("dialog1").close();   
                    
                    self.fetchSchedules();
                                                    
                    self.begin(null);
                    self.end(null);
                    self.subject(null);
                    self.room(null);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });                                                                           
        };

        this.selectedRows = ko.observableArray([]);

        self.selectionChangedListener = (event, data) => {
        
            let selectedRows = [];
            if (event.detail.value.length) {
                event.detail.value.forEach((selection) => {
                    const startRow = selection.startIndex['row'] >= 0 ? selection.startIndex['row'] : -1;
                    const startColumn = selection.startIndex['column'] >= 0 ? selection.startIndex['column'] : -1;
                    const endRow = selection.endIndex['row'] >= 0 ? selection.endIndex['row'] : -1;
                    const endColumn = selection.endIndex['column'] >= 0 ? selection.endIndex['column'] : -1;
                    const column = selection.startKey['column'];
                    const tableObj = {
                        rowStartIndex: startRow,
                        rowEndIndex: endRow,
                        columnStartIndex: startColumn,
                        columnEndIndex: endColumn
                    };
                    selectedRows.push(tableObj);                
                    console.log(JSON.stringify(self.dataSource().collection.at(startRow).get(column)));
                    var schedule = self.dataSource().collection.at(startRow).get(column);                    
                    self.schedule(schedule); 
                
                    var begin = self.getBeginByHour(schedule.begin);
                    var end = self.getEndByHour(schedule.end);
                                    
                    self.begin(begin.id);
                    self.end(end.id);                                     
                    
                    if (schedule.id) {                        
                        self.isNew(false);    
                        self.subject(schedule.subject.name); 
                        self.room(schedule.room.name);  
                    }
                    else {
                        self.isNew(true);
                    }
                                        
                });
                self.selectedRows(selectedRows);
                self.fetchRooms();               
                document.getElementById("dialog1").open();     
            }
            
        };

        self.handleSelectedTeacherChanged = (event) => {
            var selected = event.detail.value._keys.entries().next().value[0];        
            self.teacher(selected);
            self.fetchSchedules();                        
        };

        self.getBeginByHour = (hour) => {  
            var theBegin;
            
            self.begins().data.forEach(function(begin, index) {            
                if (begin.label === hour) {                    
                    theBegin = begin.begin;
                }
            });

            return theBegin;
        }

        self.getEndByHour = (hour) => {  
            var theEnd;
            
            self.ends().data.forEach(function(end, index) {            
                if (end.label === hour) {                    
                    theEnd = end.end;
                }
            });

            return theEnd;
        }

        self.getSubjectById = (id) => {  
            var theSubject;            
            
            self.subjects().data.forEach(function(subject, index) {            
                if (subject.value === id) {                    
                    theSubject = subject.subject;
                }
            });

            return theSubject;
        }

        self.getRoomById = (id) => {  
            var theRoom;            
            
            self.rooms()._dataProvider.data.forEach(function(room, index) {            
                if (room.value === id) {                    
                    theRoom = room.room;
                }
            });

            return theRoom;
        }

        self.getTeacherById = (id) => {  
            var theTeacher;                        
            
            self.data().forEach(function(teacher, index) {            
                if (teacher.id === id) {                    
                    theTeacher = teacher;
                }
            });

            return theTeacher;
        }

        


        self.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
                       
                                   
    }  

    this.openDialog = (event, data) => {                        
        document.getElementById("dialog1").open();                 
    } 

       
    return feesViewModel;
});