ko.bindingHandlers.highlighter = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var valueUnwrapped = ko.toJSON(ko.unwrap(value));
        $(element).css('word-break', 'break-all');
        $(element).html(valueUnwrapped);
        hljs.highlightBlock(element);
    }
};

var cron = (function () {
    var minutes = ko.utils.range(0, 59);
    var hours = ko.utils.range(0, 23);
    var weeks = [
        { text: "First", val: 1 },
        { text: "Second", val: 2 },
        { text: "Third", val: 3 },
        { text: "Fourth", val: 4 }
    ];
    var months = [
        { text: "January", val: 1 },
        { text: "February", val: 2 },
        { text: "March", val: 3 },
        { text: "April", val: 4 },
        { text: "May", val: 5 },
        { text: "June", val: 6 },
        { text: "July", val: 7 },
        { text: "August", val: 8 },
        { text: "September", val: 9 },
        { text: "October", val: 10 },
        { text: "Novermber", val: 11 },
        { text: "December", val: 12 }
    ];

    var days = [
        { text: "Sunday", val: 7 },
        { text: "Monday", val: 1 },
        { text: "Tuesday", val: 2 },
        { text: "Wednesday", val: 3 },
        { text: "Thursday", val: 4 },
        { text: "Friday", val: 5 },
        { text: "Saturday", val: 6 }
    ];

    var option = function (id, name, selected) {
        var self = this;
        self.id = id;
        self.name = name;
        self.isSelected = ko.observable(selected || false);
        self.active = ko.pureComputed(function () {
            return self.isSelected() ? "active" : "zzz";
        }, self);
    };

    var tabs = [
        new option(1, "Minutes"),
        new option(2, "Hourly"),
        new option(3, "Daily"),
        new option(4, "Weekly"),
        new option(5, "Monthly"),
        new option(6, "Yearly")
    ];

    var types = {
        1: 'minute', 2: 'hourly', 3: 'daily', 4: 'weekly', 5: 'monthly', 6: 'yearly'
    };

    var minuteModel = function (data) {
        data = data || {};
        var self = this;
        self.minutes = minutes;
        self.interval = ko.observable(data.interval || 0);

        cron = ko.pureComputed(function () {
            var x = self.interval() !== 0 ? self.interval() : "*";
            return "*/"+x + " * * * * *";
        });
        self.toJS = function () {
            return { interval: self.interval(), cron:cron() };
        }
    };

    var hourDayModel = function (data, isDaily) {        
        data = data || {};
        var self = this;
        self.id = data.id || (isDaily ? 3 : 2);
        self.minutes = minutes;
        self.hours = hours;
        self.isRecurring = ko.observable(data.isRecurring || "1");
        self.interval = ko.observable(data.interval || 1);
        self.hour = ko.observable(data.hour || 0);
        self.minute = ko.observable(data.minute || 0);
        cron = ko.pureComputed(function () {
            if (self.id === 3) {
                return self.isRecurring() === "1" ?
                "0 " + self.minute() + " " + self.hour() + " 1/"+self.interval()+" * ? *"
                : "0 " + self.minute() + " " + self.hour() + " ? * 1-7 *";
            }

            //return self.isRecurring() === "1" ?
            //    "0 0 0/" + self.interval() + " 1/1 * ? *"
            //    :"0 "+self.minute()+" "+ self.hour()+ " 1/1 * ? *";

            return self.isRecurring() === "1" ?
                "* */" + self.interval() + " * * * "
                :+self.minute()+" */"+ self.hour()+ " * * * ";
        });
        self.toJS = function () {
            return {
                isRecurring: self.isRecurring(),
                interval: parseInt(self.interval()),
                hour: self.hour(),
                minute: self.minute(),
                cron:cron()
            };
        }
    };

    var weekModel = function (data) {
        data = data || {};
        var self = this;
        self.id = data.id || 4;
        self.availableDays = ko.observableArray(days);
        self.minutes = minutes;
        self.hours = hours;
        self.days = ko.observableArray(data.days || []);
        self.hour = ko.observable(data.hour || 0);
        self.minute = ko.observable(data.minute || 0);

        var cron = ko.pureComputed(function() {
            return "0 " + self.minute() + " " + self.hour() + " ? * " + self.days().join() + " *";
        });

        self.toJS = function () {
            return {
                days:self.days().sort(),
                hour: self.hour(),
                minute: self.minute(),
                cron: cron()
            };
        }
    };

    var monthModel = function (data) {
        data = data || {};
        var self = this;
        self.id = data.id || 5;
        self.availableDays = ko.observableArray(days);
        self.minutes = minutes;
        self.hours = hours;
        self.weeks = weeks;

        self.isRecurring = ko.observable(data.isRecurring || "1");
        self.day = ko.observable(data.day || 1);
        self.month = ko.observable(data.month || 1);

        self.nday = ko.observable(data.nday || 1);
        self.nweek = ko.observable(data.nweek || 1);
        self.nmonth = ko.observable(data.nmonth || 1);

        self.hour = ko.observable(data.hour || 0);
        self.minute = ko.observable(data.minute || 0);

        var cron = ko.pureComputed(function () {
            return self.isRecurring() === "1" ?
                "0 " + self.minute() + " " + self.hour()+" " + self.day() + " 1/" + self.month() + " ? *"
            : "0 " + self.minute() + " " + self.hour() + " ? 1/" +
                self.nmonth()+" "+ self.nday() + "#" + self.nweek() + " *";
        });

        self.toJS = function () {
            return {
                isRecurring: self.isRecurring(),
                day: self.day(),
                month: self.month(),
                nday: self.nday(),
                nweek: self.nweek(),
                nmonth:self.nmonth(),
                hour: self.hour(),
                minute: self.minute(),
                cron:cron()
            };
        }
    };

    var yearModel = function (data) {
        data = data || {};
        var self = this;
        self.id = data.id || 5;
        self.availableDays = ko.observableArray(days);
        self.availableMonths = ko.observableArray(months);
        self.minutes = minutes;
        self.hours = hours;
        self.weeks = weeks;

        self.isRecurring = ko.observable(data.isRecurring || "1");
        self.day = ko.observable(data.day || 1);
        self.month = ko.observable(data.month || 1);

        self.nday = ko.observable(data.nday || 1);
        self.nweek = ko.observable(data.nweek || 1);
        self.nmonth = ko.observable(data.nmonth || 1);

        self.hour = ko.observable(data.hour || 0);
        self.minute = ko.observable(data.minute || 0);

        var cron = ko.pureComputed(function () {
            return self.isRecurring() === "1" ?
                "0 " + self.minute() + " " + self.hour() + " " + self.day()+" "+self.month() + " ? *"
            : "0 " + self.minute() + " " + self.hour() + " ? " +
                self.nmonth() + " " + self.nday() + "#" + self.nweek() + " *";
        });

        self.toJS = function () {
            return {
                isRecurring: self.isRecurring(),
                day: parseInt(self.day()),
                month: self.month(),
                nday: self.nday(),
                nweek: self.nweek(),
                nmonth: self.nmonth(),
                hour: self.hour(),
                minute: self.minute(),
                cron: cron()
            };
        }
    };

    var templateModel = function (key, data) {
        this.key = key;
        this.template = ko.observable(types[key]);
        this.data = data;
    };

    function getModel(key, data) {
        if (key === 1) return new minuteModel(data);
        else if (key === 2) return new hourDayModel(data);
        else if (key === 3) return new hourDayModel(data, true);
        else if (key === 4) return new weekModel(data);
        else if (key === 5) return new monthModel(data);
        else if (key === 6) return new yearModel(data);
        else return new minuteModel(data);
    }

    var cv = function (data) {
        var self = this;
        self.tabs = ko.observableArray(tabs),
        self.templateData = ko.observable(),
        self.selectedTab = ko.observable();
        self.selectTab = function (tab) {
            if (self.selectedTab().id !== tab.id) {
                ko.utils.arrayForEach(self.tabs(), function (item) {
                    item.isSelected(item.id === tab.id);
                });

                self.selectedTab(tab);
                self.templateData(new templateModel(tab.id, getModel(tab.id)));
            }
        };

        self.loadData = function (data) {
            var tab = self.tabs()[data.id - 1];
            tab.isSelected(true);
            self.selectedTab(tab);
           
            self.templateData(new templateModel(data.id, getModel(data.id, data)));
        }

        self.chosenData = ko.pureComputed(function () {
            //console.log(self.templateData().data.toJS());
            //return !self.templateData() ?
            //    ko.toJSON({}) :
            //    ko.toJSON({
            //        type: self.templateData().key,
            //        data: self.templateData().data.toJS()
            //    });

            return !self.templateData() ?
                {} :
                {
                    type: self.templateData().key,
                    data: self.templateData().data.toJS()
                };

        }, self);

        if (!data) {
            self.loadData({ id: 1 });
        }
        else {
            self.loadData(data);
        }
    }

    return { CronModel: cv };
})();

$(function () {
    function getWidgitData() {
        /*
            { id: 1, interval: 30 } //minute
            { id: 3, isRecurring: "1", minute: 0, hour: 0, interval: 5 } //daily
            { id: 4,  minute: 20, hour: 20, days: [1,2,5] } //weekly
        */
        return {
            id: 6, isRecurring: "1", day: 12, month: 4, nday: 2, nweek: 2, nmonth: 4, hour: 4,
            minute: 8
        };
    }

    var model = function () {
        var self = this;
        self.widgetModel = new cron.CronModel(getWidgitData());        
    }

    var vm = new model();
    ko.applyBindings(vm);
});