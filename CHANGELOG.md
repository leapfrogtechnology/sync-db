# Change Log

## [v1.0.0-beta.6](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.6) (2020-03-24)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.5...v1.0.0-beta.6)

**Changes**

- Setup prettier and integrate format checking in the CI [\#56](https://github.com/leapfrogtechnology/sync-db/pull/56) [[aesthetics](https://github.com/leapfrogtechnology/sync-db/labels/aesthetics)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Support both sequential and parallel execution strategies for running synchronization [\#55](https://github.com/leapfrogtechnology/sync-db/pull/55) [[config](https://github.com/leapfrogtechnology/sync-db/labels/config)] [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] [[internals](https://github.com/leapfrogtechnology/sync-db/labels/internals)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Bump acorn from 7.1.0 to 7.1.1 in /examples/node-mssql-programmatic-use [\#54](https://github.com/leapfrogtechnology/sync-db/pull/54) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump acorn from 7.1.0 to 7.1.1 in /examples/node-app-pg [\#53](https://github.com/leapfrogtechnology/sync-db/pull/53) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump acorn from 7.0.0 to 7.1.1 in /examples/node-app-mssql [\#52](https://github.com/leapfrogtechnology/sync-db/pull/52) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([dependabot[bot]](https://github.com/apps/dependabot))
- Support resolution of local project dependencies when CLI is invoked in development mode [\#50](https://github.com/leapfrogtechnology/sync-db/pull/50) [[cli](https://github.com/leapfrogtechnology/sync-db/labels/cli)] [[dev efficiency](https://github.com/leapfrogtechnology/sync-db/labels/dev%20efficiency)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Add license scan report and status [\#49](https://github.com/leapfrogtechnology/sync-db/pull/49) [[ci](https://github.com/leapfrogtechnology/sync-db/labels/ci)] [[license](https://github.com/leapfrogtechnology/sync-db/labels/license)] ([fossabot](https://github.com/fossabot))

## [v1.0.0-beta.5](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.5) (2020-03-08)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.4...v1.0.0-beta.5)

**Changes**

- Bump knex version to 0.20.11 [\#48](https://github.com/leapfrogtechnology/sync-db/pull/48) [[chore](https://github.com/leapfrogtechnology/sync-db/labels/chore)] [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-beta.4](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.4) (2020-03-05)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.3...v1.0.0-beta.4)

**Bug Fixes**

- Fix ramda merge convert issue ¯\\(ツ\)/¯ [\#47](https://github.com/leapfrogtechnology/sync-db/pull/47) [[bug](https://github.com/leapfrogtechnology/sync-db/labels/bug)] [[bugfix](https://github.com/leapfrogtechnology/sync-db/labels/bugfix)] ([cham11ng](https://github.com/cham11ng))

## [v1.0.0-beta.3](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.3) (2020-03-03)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.2...v1.0.0-beta.3)

**Bug Fixes**

- Fix fs.exists\(\) util ¯\\_\(ツ\)\_/¯ [\#46](https://github.com/leapfrogtechnology/sync-db/pull/46) [[bug](https://github.com/leapfrogtechnology/sync-db/labels/bug)] [[test](https://github.com/leapfrogtechnology/sync-db/labels/test)] [[util](https://github.com/leapfrogtechnology/sync-db/labels/util)] ([cham11ng](https://github.com/cham11ng))

## [v1.0.0-beta.2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.2) (2020-03-02)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.1...v1.0.0-beta.2)

**Changes**

- Support resolving connections from the environment directly as a fallback option [\#45](https://github.com/leapfrogtechnology/sync-db/pull/45) [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-beta.1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.1) (2020-02-26)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.9-2...v1.0.0-beta.1)

**Changes**

- Add new io utility for standard I/O operations [\#44](https://github.com/leapfrogtechnology/sync-db/pull/44) [[util](https://github.com/leapfrogtechnology/sync-db/labels/util)] ([kabirbaidhya](https://github.com/kabirbaidhya))
- Bump codecov from 3.6.1 to 3.6.5 [\#43](https://github.com/leapfrogtechnology/sync-db/pull/43) [[dependencies](https://github.com/leapfrogtechnology/sync-db/labels/dependencies)] ([dependabot[bot]](https://github.com/apps/dependabot))
- Run synchronize in a single transaction per connection [\#39](https://github.com/leapfrogtechnology/sync-db/pull/39) [[feature](https://github.com/leapfrogtechnology/sync-db/labels/feature)] [[internals](https://github.com/leapfrogtechnology/sync-db/labels/internals)] [[ux](https://github.com/leapfrogtechnology/sync-db/labels/ux)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.9-2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.9-2) (2020-02-15)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.9-1...v1.0.0-experimental.9-2)

## [v1.0.0-experimental.9-1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.9-1) (2020-02-15)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.9...v1.0.0-experimental.9-1)

**Changes**

- Update example to demonstrate config injection [\#37](https://github.com/leapfrogtechnology/sync-db/pull/37) [[example](https://github.com/leapfrogtechnology/sync-db/labels/example)] ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-alpha.9](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.9) (2020-02-04)
[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-6...v1.0.0-alpha.9)

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