#!/usr/bin/env -S node --enable-source-maps
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// target/js/rerun.js
var import_node_util = __toESM(require("node:util"), 1);
var import_node_process3 = __toESM(require("node:process"), 1);

// target/js/util/nea.js
var Nea;
(function(Nea2) {
  Nea2.is = (it) => it.length !== 0;
})(Nea || (Nea = {}));

// target/js/util/text.js
var Text;
(function(Text2) {
  Text2.block = (text) => {
    const clean = (
      // ensure we only have spaces, but never tabs
      Text2.expandTabs(4, text).replaceAll(/^\s+$/mg, "").replaceAll(/\s+$/g, "").replace(/^\n+/, "").replace(/\n+$/, "")
    );
    const lines = clean.split("\n");
    const indent = lines.map((it) => /^ */.exec(it)?.[0].length ?? 0).filter((it) => it !== 0).reduce((a, b) => Math.min(a, b), Infinity);
    const slice = indent !== Infinity ? indent : 0;
    return lines.map((it) => it.slice(slice)).join("\n");
  };
  Text2.expandTabs = (width, text) => {
    let out = "";
    let col = 0;
    let i = 0;
    while (i < text.length) {
      const c = text.charAt(i);
      switch (c) {
        case "\r":
          out += "\r";
          col = 0;
          break;
        case "\n":
          out += "\n";
          col = 0;
          break;
        case "	":
          for (; ; ) {
            out += " ";
            col += 1;
            if (col % width === 0)
              break;
          }
          break;
        default:
          out += c;
          col += 1;
          break;
      }
      i += 1;
    }
    return out;
  };
})(Text || (Text = {}));

// target/js/util/branded.js
var Branded;
(function(Branded2) {
  Branded2.brand = (it) => it;
  Branded2.unbrand = (it) => it;
})(Branded || (Branded = {}));

// target/js/util/duration.js
var Duration;
(function(Duration2) {
  Duration2.brand = (it) => Branded.brand(it);
  Duration2.since = () => {
    const start = Date.now();
    return () => {
      const end = Date.now();
      return Branded.brand(end - start);
    };
  };
})(Duration || (Duration = {}));

// target/js/node/logger.js
var Logger;
(function(Logger2) {
  Logger2.loud = {
    log: (...msg) => console.log(...msg)
  };
  Logger2.slient = {
    log: () => {
    }
  };
})(Logger || (Logger = {}));

// target/js/node/codeError.js
var CodeError;
(function(CodeError2) {
  CodeError2.is = (it) => it instanceof Error && "code" in it && typeof it.code === "string";
})(CodeError || (CodeError = {}));

// target/js/node/fsPath.js
var import_node_process = __toESM(require("node:process"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var FsPath;
(function(FsPath2) {
  FsPath2.brand = Branded.brand;
  FsPath2.cwd = () => FsPath2.brand(import_node_process.default.cwd());
  FsPath2.join = (...parts) => FsPath2.brand(import_node_path.default.join(...parts));
  FsPath2.resolve = (...parts) => FsPath2.brand(import_node_path.default.resolve(...parts));
  FsPath2.dirname = (self) => FsPath2.brand(import_node_path.default.dirname(self));
  FsPath2.basename = (self) => FsPath2.brand(import_node_path.default.basename(self));
})(FsPath || (FsPath = {}));

// target/js/node/glob.js
var Glob;
(function(Glob2) {
  Glob2.brand = Branded.brand;
})(Glob || (Glob = {}));

// target/js/util/fn.js
var Fn;
(function(Fn2) {
  Fn2.identity = (value) => value;
  Fn2.constant = (value) => (_) => value;
  Fn2.never = () => {
    throw new Error("up");
  };
  Fn2.impossible = (it) => it;
  Fn2.andThen = (st, tu) => (s) => tu(st(s));
})(Fn || (Fn = {}));

// target/js/util/promises.js
var Promises;
(function(Promises2) {
  Promises2.sleep = (millis) => new Promise((resolve, _reject) => {
    setTimeout(resolve, millis);
  });
})(Promises || (Promises = {}));

// target/js/lib/fingerprint.js
var import_promises2 = __toESM(require("node:fs/promises"), 1);

// target/js/node/fsUtil.js
var import_promises = __toESM(require("node:fs/promises"), 1);
var FsUtil;
(function(FsUtil2) {
  FsUtil2.ENOENT = /* @__PURE__ */ Symbol("ENOENT");
  FsUtil2.stat = async (path2, symlink) => {
    try {
      return await (symlink === "follow" ? import_promises.default.stat(path2, { bigint: false }) : symlink === "nofollow" ? import_promises.default.lstat(path2, { bigint: false }) : Fn.impossible(symlink));
    } catch (e) {
      if (FsUtil2.isEnoEnt(e))
        return FsUtil2.ENOENT;
      throw e;
    }
  };
  FsUtil2.isEnoEnt = (e) => CodeError.is(e) && e.code === "ENOENT";
})(FsUtil || (FsUtil = {}));

// target/js/lib/fingerprint.js
var Fingerprint;
(function(Fingerprint2) {
  Fingerprint2.scan = async ({ cwdPath, includeGlobs, excludeGlobs, abortSignal }) => {
    if (abortSignal.aborted)
      return null;
    const paths = import_promises2.default.glob(includeGlobs, {
      cwd: cwdPath,
      // NOTE passing a function here does not work - it is never called
      exclude: excludeGlobs
    });
    if (abortSignal.aborted)
      return null;
    const lines = [];
    for await (const path2 of paths) {
      if (abortSignal.aborted)
        return null;
      const absolute = FsPath.brand(path2);
      const stat = await FsUtil.stat(absolute, "nofollow");
      if (stat === FsUtil.ENOENT)
        continue;
      if (!stat.isFile())
        continue;
      lines.push(`${absolute}\0${stat.mtimeMs.toFixed(0)}`);
    }
    lines.sort();
    return Branded.brand(lines.join("\0"));
  };
})(Fingerprint || (Fingerprint = {}));

// target/js/lib/watch.js
var Watch;
(function(Watch2) {
  Watch2.run = async ({ cwdPath, includeGlobs, excludeGlobs, onEvent, logger, abortSignal }) => {
    let lastFingerprint = null;
    for (; ; ) {
      try {
        if (abortSignal.aborted)
          break;
        const sinceScanStart = Duration.since();
        const fingerprint = await Fingerprint.scan({ includeGlobs, excludeGlobs, cwdPath, abortSignal });
        if (fingerprint === null)
          break;
        const scanDuration = sinceScanStart();
        logger.log(`scanned files in ${scanDuration.toFixed(0)}ms`);
        const event = lastFingerprint === null ? "initial" : fingerprint !== lastFingerprint ? "changed" : "stable";
        const delay = onEvent(event);
        lastFingerprint = fingerprint;
        await Promises.sleep(delay);
      } catch (e) {
        logger.log("watcher failed", e);
        await Promises.sleep(soon);
      }
    }
  };
  const soon = Duration.brand(1e3);
})(Watch || (Watch = {}));

// target/js/lib/command.js
var import_node_process2 = __toESM(require("node:process"), 1);
var import_node_child_process = __toESM(require("node:child_process"), 1);
var Command;
(function(Command2) {
  Command2.start = ({ command, cwdPath, environment, logger, onExit }) => {
    logger.log(`executing command "${command.join(" ")}"`);
    const [cmd, ...args] = command;
    let child = import_node_child_process.default.spawn(cmd, args, {
      cwd: cwdPath,
      env: environment,
      // ensure the command is put into a process group
      detached: true,
      stdio: [
        import_node_process2.default.stdin,
        import_node_process2.default.stdout,
        import_node_process2.default.stderr
      ]
    });
    const kill = (signal) => {
      if (child === null)
        return;
      if (child.pid === void 0)
        return;
      logger.log(`killing command ${child.pid}`);
      import_node_process2.default.kill(-child.pid, signal);
    };
    child?.on("exit", (code, signal) => {
      logger.log(`command ${exitMessage(code, signal)}`);
      child = null;
      onExit();
    });
    return { kill };
    ;
  };
  const exitMessage = (code, signal) => code !== null ? `completed with ${code}` : signal !== null ? `exited with ${signal}` : "finished";
})(Command || (Command = {}));

// target/js/lib/controller.js
var Controller;
(function(Controller2) {
  Controller2.run = async ({ initial, cwdPath, includeGlobs, excludeGlobs, pollMillis, quickMillis, stableCount, environment, obsoleteSignal, unwantedSignal, command, logger, abortSignal }) => {
    let changed = false;
    const receive = () => {
      const result = changed;
      changed = false;
      return result;
    };
    let considering = false;
    let stableCounter = 0;
    const onEvent = (event) => {
      if (event === "initial") {
        considering = false;
        stableCounter = 0;
        if (initial) {
          changed = true;
        }
      } else if (event === "changed") {
        considering = true;
        stableCounter = 0;
      } else if (event === "stable") {
        stableCounter = stableCounter + 1;
      } else
        Fn.impossible(event);
      if (considering && stableCounter === stableCount) {
        considering = false;
        changed = true;
      }
      const pollDelay = considering ? quickMillis : pollMillis;
      return pollDelay;
    };
    const watch = Watch.run({
      cwdPath,
      includeGlobs,
      excludeGlobs,
      onEvent,
      logger,
      abortSignal
    });
    const isCommand = (it) => it !== "killing" && it !== "none";
    let child = Fn.identity("none");
    let starting = false;
    for (; ; ) {
      await Promises.sleep(shortly);
      if (abortSignal.aborted)
        break;
      if (!starting) {
        starting = receive();
      } else {
        if (isCommand(child)) {
          if (obsoleteSignal !== null) {
            logger.log("killing the child process");
            child.kill(obsoleteSignal);
            child = "killing";
          } else {
            logger.log("waiting for the child process to exit");
          }
        } else if (child === "killing") {
          logger.log("waiting for the child process to die");
        } else if (child === "none") {
          child = Command.start({
            command,
            cwdPath,
            environment,
            logger,
            onExit: () => {
              child = "none";
            }
          });
          starting = false;
        } else
          Fn.impossible(child);
      }
    }
    for (; ; ) {
      await Promises.sleep(shortly);
      if (isCommand(child)) {
        if (unwantedSignal !== null) {
          logger.log("killing the child process");
          child.kill(unwantedSignal);
          child = "killing";
        } else {
          logger.log("waiting for the child process to exit");
        }
      } else if (child === "killing") {
        logger.log("waiting for the child process to die");
      } else if (child === "none") {
        break;
      } else
        Fn.impossible(child);
    }
    await watch;
  };
  const shortly = Duration.brand(10);
})(Controller || (Controller = {}));

// target/js/rerun.js
var main = (args) => {
  const params = parseParams(args);
  if (params === "help") {
    Logger.loud.log(usage);
    return;
  } else if (params === "unknown_option" || params === "invalid_args") {
    Logger.loud.log(usage);
    import_node_process3.default.exitCode = 1;
    return;
  }
  const cwdPath = params.cwdPath !== null ? FsPath.resolve(params.cwdPath) : FsPath.cwd();
  const obsoleteSignal = params.killFlag ? "SIGTERM" : null;
  const unwantedSignal = "SIGTERM";
  const logger = params.verboseFlag ? Logger.loud : Logger.slient;
  const abortController = new AbortController();
  const abortSignal = abortController.signal;
  const stop = () => {
    if (abortSignal.aborted)
      return;
    logger.log("requested to die");
    abortController.abort();
  };
  import_node_process3.default.on("SIGHUP", stop);
  import_node_process3.default.on("SIGINT", stop);
  import_node_process3.default.on("SIGTERM", stop);
  void Controller.run({
    initial: true,
    cwdPath,
    includeGlobs: params.includeGlobs,
    excludeGlobs: params.excludeGlobs,
    pollMillis: params.pollMillis,
    quickMillis: params.quickMillis,
    stableCount: params.stableCount,
    environment: import_node_process3.default.env,
    obsoleteSignal,
    unwantedSignal,
    command: params.command,
    logger,
    abortSignal
  });
};
var scriptName = FsPath.basename(FsPath.brand(import_node_process3.default.argv[1]));
var defaults = {
  pollMillis: Duration.brand(400),
  quickMillis: Duration.brand(50),
  stableCount: 3
};
var usage = Text.block(`
		usage: ${scriptName} [...option] [--] command [...args]

		options
			--help/-h					display this help
			--verbose/-v				print some debug output
			--include/-i	<glob>		watch files matching this glob
			--exclude/-e	<glob>		ignore files matching this glob
			--cwd/-c					working directory for watching and running the command
			--poll/-p		<millis>	polling interval for filesystem scans during steady state (default: ${defaults.pollMillis} ms)
			--quick/-q		<millis>	polling interval for filesystem scans while stabilizing (default: ${defaults.quickMillis} ms)
			--stable/-s		<count>		how often to poll (quickly) before considering files stable (default: ${defaults.stableCount})
			--kill/-k					kill a running command instead of waiting for it to finish

		globs
			glob syntax is based on node's builtin function fsPromises.glob() which is in
			turn based on (or identical to) minimatch. attention: dotfiles are only included
			if explicitly requested, e.g. like this: '{,.}env'
	`);
var parseParams = (args) => {
  try {
    const parameters = import_node_util.default.parseArgs({
      args: Array.from(args),
      options: {
        // other
        help: {
          type: "boolean",
          multiple: false,
          short: "h",
          default: false
        },
        verbose: {
          type: "boolean",
          multiple: false,
          short: "v",
          default: false
        },
        include: {
          type: "string",
          multiple: true,
          short: "i",
          default: []
        },
        exclude: {
          type: "string",
          multiple: true,
          short: "e",
          default: []
        },
        cwd: {
          type: "string",
          multiple: false,
          short: "c"
          // default:	"",
        },
        poll: {
          type: "string",
          multiple: false,
          short: "p"
          // default:	"",
        },
        quick: {
          type: "string",
          multiple: false,
          short: "q"
          // default:	"",
        },
        stable: {
          type: "string",
          multiple: false,
          short: "s"
          // default:	"",
        },
        kill: {
          type: "boolean",
          multiple: false,
          short: "k",
          default: false
        }
      },
      strict: true,
      allowPositionals: true,
      tokens: true
    });
    const values = parameters.values;
    if (values.help)
      return "help";
    if (!Nea.is(values.include))
      return "invalid_args";
    let pollMillis = defaults.pollMillis;
    if (values.poll !== void 0) {
      pollMillis = Duration.brand(parseInt(values.poll));
      if (!Number.isSafeInteger(pollMillis))
        return "invalid_args";
      if (pollMillis <= 0)
        return "invalid_args";
    }
    let quickMillis = defaults.quickMillis;
    if (values.quick !== void 0) {
      quickMillis = Duration.brand(parseInt(values.quick));
      if (!Number.isSafeInteger(quickMillis))
        return "invalid_args";
      if (quickMillis <= 0)
        return "invalid_args";
    }
    let stableCount = defaults.stableCount;
    if (values.stable !== void 0) {
      stableCount = parseInt(values.stable);
      if (!Number.isSafeInteger(stableCount))
        return "invalid_args";
      if (stableCount < 0)
        return "invalid_args";
    }
    const command = parameters.positionals;
    if (!Nea.is(command))
      return "invalid_args";
    const cwdPath = values.cwd !== void 0 ? FsPath.brand(values.cwd) : null;
    return {
      verboseFlag: values.verbose,
      cwdPath,
      includeGlobs: values.include.map(Glob.brand),
      excludeGlobs: values.exclude.map(Glob.brand),
      pollMillis,
      quickMillis,
      stableCount,
      killFlag: values.kill,
      command
    };
  } catch (e) {
    if (CodeError.is(e) && e.code === "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
      return "unknown_option";
    }
    throw e;
  }
};
main(import_node_process3.default.argv.slice(2));
//# sourceMappingURL=rerun.cjs.map
