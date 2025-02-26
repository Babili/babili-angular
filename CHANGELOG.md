# Changelog

## 19.0.2 [2025-02-26]

* Better support for Angular 19

## 19.0.0 [2024-11-24]

* Support for Angular 19

## 18.0.1 [2024-06-03]

* Support for Angular 18

## 17.0.0 [2024-02-05]

* Support for Angular 17

## 16.0.0 [2023-05-07]

* Support for Angular 16

## 1.3.0 [2023-01-30]

* Support for Angular 15

## 1.2.6 [2022-10-28]

* Better management of RxJS pipes
* Upgrade all dependencies
* Enable ESLint

## 1.2.3 [2022-10-24]

* Bug - `Me.unreadMessageCount` observability does not work
## 1.2.2 [2022-10-16]

* Bug - onReceivedMessage produces infinite loops

## 1.2.0 [2022-10-15]

* Make every mutable value observable
* Use `ng-packagr@14.2.1`

## 1.1.6 [2022-08-30]

* Minimal version of Angular required is `14`
* Use `ng-packagr@14.2.0`

## 1.1.5 [2022-06-13]

* Complete replacement of `dayjs`
## 1.1.4 [2022-03-05]

* Breaking change: Replace `moment` with `dayjs`

## 1.1.2 [2022-03-02]

* Minimal version of Angular required is `13`
* Use `ng-packagr@13.2.1`
* Minimal version of `socket.io-client` is `4.4.1`

## 1.1.0 [2021-08-04]

* Minimal version of Angular required is `12`
* Use `ng-packagr@12.2.0`
* Minimal version of `socket.io-client` is `4.1.3`
* Only compatible with `babili-pusher` image equal or greater than `babili/pusher:1.1.0`
* Add observable `internalShortname` on `Room`

## 1.0.2 [2020-04-24]

* Make 'User.markAllReceivedMessagesAsRead' public
* Expose static 'sortedByLastActivityDesc' on Room
* Make 'onMessageReceive' reactive
* Add observable 'lastMessage' on Rooms

## 1.0.1 [2020-04-22]

* Add `isPersisted` on `Room`

## 1.0.0 [2020-04-22]

* Upgrade all dependencies
* Minimal version of Angular required is 9
* Use `ng-packagr@9.1.1`

## 0.14.2 [2019-09-09]

* More resillience when opening a room
* Use `ng-packagr@5.5.0` to work with Node 12

## 0.14.0 [2019-02-25]

* Move to Angular 7+
* Move to Socker.io-client 2.2.0