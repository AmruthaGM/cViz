var Q = require('q');
var _ = require('underscore');
var bcrypt = require('bcryptjs');
var path              = require('path');

var constants               = require('../scripts/constants');
var logger                      = require(constants.paths.scripts + "/logger");
var model                   = require(constants.paths.models +  '/user')
var config            = require(path.join(constants.paths.config, '/config'));

// Service method definition -- Begin
var service = {};

service.getAll = getAll;
service.create = create;

service.getOneById = getOneById;
service.updateById = updateById;
service.deleteById = deleteById;
service.getAllUsers = getAllUsers;
service.getByEmail = getByEmail;
service.getWithQuery = getWithQuery;
service.getCount = getCount;

module.exports = service;

// Method implementations
function getAll(){
    var deferred = Q.defer();

    model.find(function(err, list){
        if(err) {
            console.log(err);
            deferred.reject(err);
        }
        else
            deferred.resolve(list);
    });

    return deferred.promise;
} // getAll method ends

function getAll(page,perPage,sort,query,fields){

    // console.log("--------- in getAll of service  page,perPage,sort,query,fields = ", page,perPage,sort,query,fields)
    var deferred = Q.defer();
    var header = [];
    header.push({
        'start' : page,
        'size' : perPage,
        'filter' : query,
        'sort' : sort,
        'fields' : fields
    })
    model
    .find(query)
    .limit(perPage)
    .skip(perPage*page)
    .sort(sort)
    .select(fields)
    .exec(function(err, list){
        if(err) {
            console.log(err);
            deferred.reject(err);
        }
        else
            deferred.resolve(list);
    });

    return deferred.promise;
}


function getCount(){
    var deferred = Q.defer();
    model.count({}, function(err, count){
        if(err) {
            console.log(err);
            deferred.reject(err);
        }
        else{
            deferred.resolve({totalCount:count});
        }
        
    });
    return deferred.promise;
}

function getOneById(id){
    var deferred = Q.defer();
    model
        .findOne({ _id: id })
        .exec(function (err, item) {
            if(err) {
                console.log(err);
                deferred.reject(err);
            }
            else{
              deferred.resolve(item);
            }
        });

    return deferred.promise;
} // gentOneById method ends

function create(userParam) {
    var deferred = Q.defer();

    // validation
    model.findOne(
        { email: userParam.email },

        function (err, user) {
            if (err) deferred.reject(err);

            if (user) {
                // handle already exists
                deferred.reject('Email id {"' + userParam.handle + '"} is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {
      if(typeof userParam.local == "undefined")
        userParam.local = {};

      // set user object to userParam without the cleartext password
      var user = _.omit(userParam, 'password');
      if(userParam.local.email == null)
        userParam.local.email = userParam.email;

      if(userParam.local.password != null)
        {
        user.local.password = bcrypt.hashSync(userParam.local.password, bcrypt.genSaltSync(8), null);
        }

      if(userParam.local.password == null)
        {
         localPassword = randomPassword(userParam.name.first.length);
         var bcryptPassword = bcrypt.hashSync(localPassword, bcrypt.genSaltSync(8), null);
         var pwdwithoutSlash =  bcryptPassword.replace(/\//g, "");
         user.local.password = pwdwithoutSlash;
        }

        model.create(
            user,
            function (err, doc) {
                if (err) {
                    console.log(err);
                    deferred.reject(err);
                }

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function randomPassword(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}

function updateById(id, data) {
    var deferred = Q.defer();

    model.findByIdAndUpdate(id, data, function (err, doc) {
        if (err) {
            deferred.reject(err);
        }
        else
            deferred.resolve(doc);
    });

    return deferred.promise;
}

function deleteById(id) {
    var deferred = Q.defer();

    model.findByIdAndRemove(id, function (err, doc) {
        if (err) {
            deferred.reject(err);
        }
        else{
            deferred.resolve(doc);
        }
    });

    return deferred.promise;
}

function getByEmail(email){
    var deferred = Q.defer();

    model
        .findOne({ email: email })
        .exec(function (err, item) {
            if(err) {
                console.log(err);
                deferred.reject(err);
            }
            else
                deferred.resolve(item);
        });

    return deferred.promise;
} // gentOneById method ends

function getAllUsers(query, fields, maxRecs, sortEx){

    var deferred = Q.defer();
    var usersArray = [];
    var userDesig = []
    model
    .find(query)
    .limit(maxRecs)
    .select(fields)
    .sort(sortEx)
    .exec(function(err, list){
        if(err) {
            console.log(err);
            deferred.reject(err);
        }
        else
            for(var i=0;i<list.length;i++)
            {
                if(usersArray.indexOf(list[i].jobTitle) === -1){
                    usersArray.push(list[i].jobTitle);
                }
            }

            var data = usersArray;

            for (var i = 0; i < data.length; i++) {
                userDesig.push({'designation':data[i]});
            }

            deferred.resolve
            ({
                "items": userDesig
            });
    });
    return deferred.promise;
} // getAll method ends


function getWithQuery(query, fields, maxRecs, sortEx){
    var deferred = Q.defer();
    var usersArray = [];
    var usersArray1 = [];

    model
    .find(query)
    .limit(maxRecs)
    .select(fields)
    .sort(sortEx)
    .exec(function (err, item) {
        if(err) {
            console.log(err);
            deferred.reject(err);
        }
        else
            for(var i=0;i<item.length;i++)
            {
                if(item[i].association=='employee')
                {
                usersArray.push(transform(item[i]));
                }

                if(item[i].association == 'customer' || item[i].association=='employee')
                {
                    usersArray1.push(transform(item[i]));
                }
            }

            deferred.resolve
            ({
                "items": usersArray,
                "items1":usersArray1
            });
    });

    function transform(user)
    {
        if (user==null) {
            console.log("error in adding");
        }
        else{
            var userData={
                userid : user._id,
                firstName :user.name.first,
                lastName :user.name.last,
                email : user.email,
                avatar :user.avatar,
                association :user.association,
                jobTitle : user.jobTitle
            }
            return userData;
        }
    }
    return deferred.promise;
} // getWithQuery method ends
