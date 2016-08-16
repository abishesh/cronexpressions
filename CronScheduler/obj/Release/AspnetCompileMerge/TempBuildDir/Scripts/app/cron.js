/* Cron widgit library*/
var cron = (function () {
    //var shouter = new ko.subscribable();
    //var token = "messageToken";

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var minuteModel = function () { };

    var hourModel = function (minute) {
        this.minutes = ko.utils.range(0, 59);
        this.minute = ko.observable(minute || 0);
    };

    var dayModel = function (hour, minute, ampm) {
        this.minutes = ko.utils.range(0, 59);
        this.hours = ko.utils.range(1, 12);
        this.hour = ko.observable(hour || 1);
        this.minute = ko.observable(minute || 0);
        this.meredian = ko.observable(ampm || 'AM');
    };

    var weekModel = function (day, hour, minute, ampm) {
        this.days = days;
        this.day = ko.observable(day || 'Sunday');
        this.dayModel = ko.observable(new dayModel(hour, minute, ampm));
    }

    var monthModel = function (day, hour, minute, ampm) {
        this.days = ko.utils.range(1, 31);
        this.day = ko.observable(day || 1);
        this.dayModel = ko.observable(new dayModel(hour, minute, ampm));
    }

    var yearModel = function (month, day, hour, minute, ampm) {
        this.months = months;
        this.month = ko.observable(month || 'Jan');
        this.days = ko.utils.range(1, 31);
        this.day = ko.observable(day || 1);
        this.dayModel = ko.observable(new dayModel(hour, minute, ampm));
    }

    var templateModel = function (key, template, data) {
        this.key = key;
        this.template = ko.observable(template);
        this.data = data;
    };

    var option = function (id, name) {
        this.id = id;
        this.name = name;
    };

    var options = [
        new option(1, "Minute"),
        new option(2, "Hour"),
        new option(3, "Day"),
        new option(4, "Week"),
        new option(5, "Month"),
        new option(6, "Year")
    ];

    var templates = {
        1: new templateModel('minute', 'Minute', new minuteModel()),
        2: new templateModel('hour', 'Hour', new hourModel()),
        3: new templateModel('day', 'Day', new dayModel()),
        4: new templateModel('week', 'Week', new weekModel()),
        5: new templateModel('month', 'Month', new monthModel()),
        6: new templateModel('year', 'Year', new yearModel())
    };

    var viewModel = function () {

        var self = this;
        self.templates = templates;
        self.availableOptions = ko.observableArray(options);
        self.selectedOption = ko.observable();

        self.templateData = ko.observable();

        self.selectedOption.subscribe(function () {
            self.templateData(self.templates[self.selectedOption().id]);
        });

        var notifier = new ko.subscribable();
        var token = "messageToken";

        self.loadData = function (data) {
            if (!data) return;

            var templateData = {
                'minute': { type: 0, data: new templateModel('minute', 'Minute', new minuteModel()) },
                'hour': { type: 1, data: new templateModel('hour', 'Hour', new hourModel(data.minute)) },
                'day': { type: 2, data: new templateModel('day', 'Day', new dayModel(data.hour, data.minute, data.ampm)) },
                'week': { type: 3, data: new templateModel('week', 'Week', new weekModel(data.day, data.hour, data.minute, data.ampm)) },
                'month': { type: 4, data: new templateModel('month', 'Month', new monthModel(data.day, data.hour, data.minute, data.ampm)) },
                'year': { type: 5, data: new templateModel('year', 'Year', new yearModel(data.month, data.day, data.hour, data.minute, data.ampm)) }
            };

            var type = templateData[data.type].type;
            var x = templateData[data.type].data;
            self.selectedOption(options[type]);
            self.templateData(x);
            notifier.notifySubscribers(self.templateData(), token);
        }

        self.notify = function() {
            notifier.notifySubscribers(self.templateData(), token);            
        }

        self.templateData.subscribe(function(newValue) {
            notifier.notifySubscribers(newValue, token);
        });

        self.subscribeToChange = function(arg) {
            notifier.subscribe(function (data) {
                arg(data);
            }, self, token);
            return self;
        }
    };

    return { CronViewModel: viewModel };
})();