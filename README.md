# rerun

`rerun` polls the filesystem and runs a command when files change.
much like `onchange` - but a lot more focussed.

## usage

use `rerun --help` to show command line options.

## why

there are two important differences from other, similar projects:

firstly, `rerun` does not even try to watch the filesystem and resorts to plain
old polling instead:

filesystem watching in general has quite a few problems: behaviour differs
wildly between operating systems. there is a limit to the number of files one
can watch - and other tools like tsc and vscode are fighting for these already,
which can lead to changes getting lost.

on the other hand, modern SSDs are plenty fast enough to achieve decent latency
for any project within sane size limits.

secondly, `rerun` tries hard to ensure doing the right thing:
* commands are cleanly killed and awaited when `rerun` itself is killed.
* there is never more than one command running at a time.
* commands are started only after the filesystem settles

thirdly, `rerun` does not require any external dependencies:

this helps reducing the attack surface for supply-chain attacks.
