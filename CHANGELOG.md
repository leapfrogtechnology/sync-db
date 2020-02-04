# Change Log

## [v1.0.0-experimental.8-6](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-6) (2020-02-03)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-5...v1.0.0-experimental.8-6)

**Changes**

- Avoid vendor specific defaults in the config [\#41](https://github.com/leapfrogtechnology/sync-db/pull/41) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Generate connection with port as number when using --generate-connections CLI arg [\#40](https://github.com/leapfrogtechnology/sync-db/pull/40) ([silwalanish](https://github.com/silwalanish))
- Update dependencies - typescript & tslint [\#38](https://github.com/leapfrogtechnology/sync-db/pull/38) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Config Injection - ability to inject dynamic configurations such that the running SQL transactions could access them [\#36](https://github.com/leapfrogtechnology/sync-db/pull/36) [[experimental](https://github.com/leapfrogtechnology/sync-db/labels/experimental)] [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.8-5](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-5) (2020-02-01)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-4...v1.0.0-experimental.8-5)

## [v1.0.0-experimental.8-4](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-4) (2020-01-19)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-3...v1.0.0-experimental.8-4)

## [v1.0.0-experimental.8-3](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-3) (2020-01-19)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-2...v1.0.0-experimental.8-3)

## [v1.0.0-experimental.8-2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-2) (2020-01-19)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-1...v1.0.0-experimental.8-2)

## [v1.0.0-experimental.8-1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-1) (2020-01-19)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.8...v1.0.0-experimental.8-1)

**Implemented enhancements:**

- CLI arg to generate connections from the environment [\#33](https://github.com/leapfrogtechnology/sync-db/pull/33) [[cli](https://github.com/leapfrogtechnology/sync-db/labels/cli)] [[enhancement](https://github.com/leapfrogtechnology/sync-db/labels/enhancement)] [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] ([p0k8h](https://github.com/p0k8h))

**Closed Issues**

- New CLI arg to generate connections file using the environment variables [\#31](https://github.com/leapfrogtechnology/sync-db/issues/31) [[cli](https://github.com/leapfrogtechnology/sync-db/labels/cli)] [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)]
- Add new example project based on postgres [\#25](https://github.com/leapfrogtechnology/sync-db/issues/25) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)] [[postgres](https://github.com/leapfrogtechnology/sync-db/labels/postgres)]

**Changes**

- Add example project for postgres [\#35](https://github.com/leapfrogtechnology/sync-db/pull/35) [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] [[postgres](https://github.com/leapfrogtechnology/sync-db/labels/postgres)] ([Prabeshpd](https://github.com/Prabeshpd))

## [v1.0.0-alpha.8](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.8) (2019-12-18)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.7...v1.0.0-alpha.8)

**Changes**

- Bump knex to version 0.20.4 and upgrade vulnerable packages [\#34](https://github.com/leapfrogtechnology/sync-db/pull/34) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([mesaugat](https://github.com/mesaugat))

## [v1.0.0-alpha.7](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.7) (2019-12-11)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.6...v1.0.0-alpha.7)

**Implemented enhancements:**

- Setup docker and docker-compose configuration for the node-app-mssql example [\#23](https://github.com/leapfrogtechnology/sync-db/pull/23) [[enhancement](https://github.com/leapfrogtechnology/sync-db/labels/enhancement)] ([silwalanish](https://github.com/silwalanish))

**Bug Fixes**

- Logs are misleading in rollback / teardown stage [\#5](https://github.com/leapfrogtechnology/sync-db/issues/5) [[bug](https://github.com/leapfrogtechnology/sync-db/labels/bug)] [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)]

**Closed Issues**

- Add sample tables using knex migrations for the node-app-mssql example [\#21](https://github.com/leapfrogtechnology/sync-db/issues/21) [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)] [[hacktoberfest](https://github.com/leapfrogtechnology/sync-db/labels/hacktoberfest)]
- CI - Integrate test code coverage reporting. [\#18](https://github.com/leapfrogtechnology/sync-db/issues/18) [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)] [[help wanted](https://github.com/leapfrogtechnology/sync-db/labels/help%20wanted)] [[test](https://github.com/leapfrogtechnology/sync-db/labels/test)]
- Add an example with showing the programmatic usage in Node / JavaScript [\#12](https://github.com/leapfrogtechnology/sync-db/issues/12) [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)] [[hacktoberfest](https://github.com/leapfrogtechnology/sync-db/labels/hacktoberfest)] [[help wanted](https://github.com/leapfrogtechnology/sync-db/labels/help%20wanted)]
- Setup docker and docker-compose configuration for the node-app-mssql example [\#8](https://github.com/leapfrogtechnology/sync-db/issues/8) [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] [[good first issue](https://github.com/leapfrogtechnology/sync-db/labels/good%20first%20issue)] [[hacktoberfest](https://github.com/leapfrogtechnology/sync-db/labels/hacktoberfest)]

**Changes**

- Fix file name mistake [\#30](https://github.com/leapfrogtechnology/sync-db/pull/30) ([p0k8h](https://github.com/p0k8h))
- Added an example showing programmatic usuage of sync-db Node/JS [\#29](https://github.com/leapfrogtechnology/sync-db/pull/29) [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] [[programmatic-api](https://github.com/leapfrogtechnology/sync-db/labels/programmatic-api)] ([p0k8h](https://github.com/p0k8h))
- Throw an error if object type names doesn't match directory convention [\#28](https://github.com/leapfrogtechnology/sync-db/pull/28) [[bugfix](https://github.com/leapfrogtechnology/sync-db/labels/bugfix)] ([p0k8h](https://github.com/p0k8h))
- Upgrade TypeScript to 3.7.2 [\#27](https://github.com/leapfrogtechnology/sync-db/pull/27) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Upgrade knex minimum version to 0.19.5 [\#26](https://github.com/leapfrogtechnology/sync-db/pull/26) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] [[security](https://github.com/leapfrogtechnology/sync-db/labels/security)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Use knex to create, run, rollback migrations with samples [\#24](https://github.com/leapfrogtechnology/sync-db/pull/24) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] ([p0k8h](https://github.com/p0k8h))
- Integrate test code coverage reporting with Codecov and Travis. [\#19](https://github.com/leapfrogtechnology/sync-db/pull/19) [[test](https://github.com/leapfrogtechnology/sync-db/labels/test)] ([ghost](https://github.com/ghost))

## [v1.0.0-alpha.6](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.6) (2019-08-28)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.5...v1.0.0-alpha.6)

**Changes**

-  Downgrade knex version to 0.16.3 [\#16](https://github.com/leapfrogtechnology/sync-db/pull/16) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([SafalPandey](https://github.com/SafalPandey))

## [v1.0.0-alpha.5](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.5) (2019-08-28)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.4...v1.0.0-alpha.5)

**Implemented enhancements:**

- Support knex transactions in synchronize [\#15](https://github.com/leapfrogtechnology/sync-db/pull/15) [[enhancement](https://github.com/leapfrogtechnology/sync-db/labels/enhancement)] ([SafalPandey](https://github.com/SafalPandey))

## [v1.0.0-alpha.4](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.4) (2019-08-27)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.3...v1.0.0-alpha.4)

**Changes**

- Configure Travis CI for running tests [\#13](https://github.com/leapfrogtechnology/sync-db/pull/13) [[test](https://github.com/leapfrogtechnology/sync-db/labels/test)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Simplify programmatic usage and documentation [\#11](https://github.com/leapfrogtechnology/sync-db/pull/11) [[cli](https://github.com/leapfrogtechnology/sync-db/labels/cli)] [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] [[programmatic-api](https://github.com/leapfrogtechnology/sync-db/labels/programmatic-api)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-alpha.3](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.3) (2019-08-26)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.2...v1.0.0-alpha.3)

**Implemented enhancements:**

- Enable passing connection instance as well as connection config for synchronization [\#10](https://github.com/leapfrogtechnology/sync-db/pull/10) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] [[enhancement](https://github.com/leapfrogtechnology/sync-db/labels/enhancement)] [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] ([SafalPandey](https://github.com/SafalPandey))

**Changes**

- Improvements on the README Documentation [\#7](https://github.com/leapfrogtechnology/sync-db/pull/7) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-alpha.2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.2) (2019-08-09)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.1...v1.0.0-alpha.2)

**Changes**

- Remove password attribute from connections object before logging [\#6](https://github.com/leapfrogtechnology/sync-db/pull/6) ([SafalPandey](https://github.com/SafalPandey))
- Set published source for sync-db [\#4](https://github.com/leapfrogtechnology/sync-db/pull/4) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] ([shradayshakya](https://github.com/shradayshakya))

## [v1.0.0-alpha.1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.1) (2019-08-07)
**Implemented enhancements:**

- Refactor code for accessing database connections. [\#1](https://github.com/leapfrogtechnology/sync-db/pull/1) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] [[enhancement](https://github.com/leapfrogtechnology/sync-db/labels/enhancement)] ([shradayshakya](https://github.com/shradayshakya))

**Changes**

- Add documentation for global installation [\#2](https://github.com/leapfrogtechnology/sync-db/pull/2) [[documentation](https://github.com/leapfrogtechnology/sync-db/labels/documentation)] ([shradayshakya](https://github.com/shradayshakya))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*