"use strict";

/**
 * Module dependencies.
 */

const express = require("express");
const session = require("express-session");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const csrf = require("csurf");
const cors = require("cors");
const helmet = require("helmet");
const upload = require("multer")();

const mongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const winston = require("winston");
const helpers = require("view-helpers");
const ultimatePagination = require("ultimate-pagination");
const requireHttps = require("./middlewares/require-https");
const exphbs = require("express-handlebars");
const sassMiddleware = require("node-sass-middleware");
const config = require("./");
const pkg = require("../package.json");
const path = require("path");

const env = process.env.NODE_ENV || "development";

/**
 * Expose
 */

module.exports = function(app, passport) {
  app.use(helmet());
  app.use(requireHttps);

  // Compression middleware (should be placed before express.static)
  app.use(
    compression({
      threshold: 512
    })
  );

  app.use(
    sassMiddleware({
      /* Options */
      src: path.join(__dirname, "../scss"),
      dest: path.join(__dirname, "../public/css/"),
      debug: true,
      outputStyle: "compressed",
      prefix: "/css"
    })
  );

  app.use(
    cors({
      origin: ["http://localhost:3000", "https://reboil-demo.herokuapp.com"],
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      credentials: true
    })
  );

  // Static files middleware
  app.use(express.static(config.root + "/public"));

  // Use winston on production
  let log = "dev";
  if (env !== "development") {
    log = {
      stream: {
        write: message => winston.info(message)
      }
    };
  }

  // Don't log during tests
  // Logging middleware
  if (env !== "test") app.use(morgan(log));

  // set views path, template engine and default layout
  app.set("views", config.root + "/app/views");

  app.engine(
    "handlebars",
    exphbs({
      helpers: {
        ifCond: function(v1, operator, v2, options) {
          switch (operator) {
            case "==":
              return v1 == v2 ? options.fn(this) : options.inverse(this);
            case "===":
              return v1 === v2 ? options.fn(this) : options.inverse(this);
            case "!=":
              return v1 != v2 ? options.fn(this) : options.inverse(this);
            case "!==":
              return v1 !== v2 ? options.fn(this) : options.inverse(this);
            case "<":
              return v1 < v2 ? options.fn(this) : options.inverse(this);
            case "<=":
              return v1 <= v2 ? options.fn(this) : options.inverse(this);
            case ">":
              return v1 > v2 ? options.fn(this) : options.inverse(this);
            case ">=":
              return v1 >= v2 ? options.fn(this) : options.inverse(this);
            case "&&":
              return v1 && v2 ? options.fn(this) : options.inverse(this);
            case "||":
              return v1 || v2 ? options.fn(this) : options.inverse(this);
            default:
              return options.inverse(this);
          }
        },
        isAuthenticated: function(req, options) {
          if (req.isAuthenticated()) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        }
      }
    })
  );
  app.set("view engine", "handlebars");

  // expose package.json to views
  app.use(function(req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(upload.single("image"));
  app.use(
    methodOverride(function(req) {
      if (req.body && typeof req.body === "object" && "_method" in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
    })
  );

  // CookieParser should be above session
  app.use(cookieParser());
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: pkg.name,
      store: new mongoStore({
        url: config.db,
        collection: "sessions"
      })
    })
  );

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages - should be declared after sessions
  app.use(flash());

  // should be declared after session and flash
  app.use(helpers(pkg.name));

  if (env !== "test") {
    app.use(csrf());

    // This could be moved to view-helpers :-)
    app.use(function(req, res, next) {
      res.locals.csrf_token = req.csrfToken();
      res.locals.paginate = ultimatePagination.getPaginationModel;
      next();
    });
  }

  if (env === "development") {
    app.locals.pretty = true;
  }
};
