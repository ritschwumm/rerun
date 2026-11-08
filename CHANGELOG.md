# 2.3.0

* slow down polling by default to save cpu and battery power
* speed up polling between first detection of a change and determining the filesystem is stable again to improve latency

# 2.2.0

* improved usage string

# 2.1.0

* rework restart algorithm
	* a new child is now started whenever the filesystem changed and then stabilized over a number of polling cycles
	* the new option `--stable <count>` configures the number of polling cycles after which the filesystem is considered stable
	* the option `--delay <millis>` has been removed

# 2.0.0

* removed chokidar, simple polling with node builtins is good enough

# 1.0.0

initial release
