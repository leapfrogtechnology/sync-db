# Changelog

## [v1.0.0-beta.11](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.11) (2021-03-25)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.10...v1.0.0-beta.11)

**Bug Fixes**

- Throw an exception to rollback transaction if SQL migration fails [\#117](https://github.com/leapfrogtechnology/sync-db/pull/117) ([cham11ng](https://github.com/cham11ng))

**Closed Issues**

- Simplify all the examples and bump sync-db to latest version [\#114](https://github.com/leapfrogtechnology/sync-db/issues/114)

**Changes**

- Fixes in progammatic example [\#118](https://github.com/leapfrogtechnology/sync-db/pull/118) ([samirsilwal](https://github.com/samirsilwal))
- Fixes in mssql & pg node examples with JS migrations [\#116](https://github.com/leapfrogtechnology/sync-db/pull/116) ([samirsilwal](https://github.com/samirsilwal))
- Some fixes in example for ts migrations with node & mssql [\#115](https://github.com/leapfrogtechnology/sync-db/pull/115) ([samirsilwal](https://github.com/samirsilwal))
- Move ts-node to dependencies [\#113](https://github.com/leapfrogtechnology/sync-db/pull/113) ([mesaugat](https://github.com/mesaugat))
- Make running the example a trivial process [\#112](https://github.com/leapfrogtechnology/sync-db/pull/112) ([mesaugat](https://github.com/mesaugat))

## [v1.0.0-beta.10](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.10) (2021-03-21)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.9...v1.0.0-beta.10)

**Implemented enhancements:**

- Add make-publish command to publish templates for customization and interpolate templates [\#109](https://github.com/leapfrogtechnology/sync-db/pull/109) ([cham11ng](https://github.com/cham11ng))

**Changes**

- Auto-update README.md about CLI usage and commands [\#111](https://github.com/leapfrogtechnology/sync-db/pull/111) ([cham11ng](https://github.com/cham11ng))
- Changelog for 1.0.0-beta.9 release  [\#110](https://github.com/leapfrogtechnology/sync-db/pull/110) ([samirsilwal](https://github.com/samirsilwal))

## [v1.0.0-beta.9](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.9) (2021-03-16)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.8...v1.0.0-beta.9)

**Bug Fixes**

- Fix migration issue by including file extension [\#107](https://github.com/leapfrogtechnology/sync-db/pull/107) ([cham11ng](https://github.com/cham11ng))

**Closed Issues**

- Add examples and update documentation for JS/TS migrations and dry-run command [\#90](https://github.com/leapfrogtechnology/sync-db/issues/90)

**Changes**

- Fix parallel strategy test case and release.sh script [\#108](https://github.com/leapfrogtechnology/sync-db/pull/108) ([cham11ng](https://github.com/cham11ng))
- Move @istanbuljs/nyc-config-typescript to dev dependencies [\#106](https://github.com/leapfrogtechnology/sync-db/pull/106) ([cham11ng](https://github.com/cham11ng))
- Fix release script to use proper version in commit message [\#104](https://github.com/leapfrogtechnology/sync-db/pull/104) ([samirsilwal](https://github.com/samirsilwal))
- Update changelog manually [\#103](https://github.com/leapfrogtechnology/sync-db/pull/103) ([samirsilwal](https://github.com/samirsilwal))
- Add examples and update documentation for JS/TS migrations and dry-run command [\#100](https://github.com/leapfrogtechnology/sync-db/pull/100) ([cham11ng](https://github.com/cham11ng))

## [v1.0.0-beta.8](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.8) (2021-03-10)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.7...v1.0.0-beta.8)

**Implemented enhancements:**

- Add new command --print-sql which prints sql statements for all the steps [\#95](https://github.com/leapfrogtechnology/sync-db/issues/95)

**Changes**

- FIX - Install changelog generator [\#102](https://github.com/leapfrogtechnology/sync-db/pull/102) ([samirsilwal](https://github.com/samirsilwal))
- Remove short character \(-f\) command for dry-run [\#101](https://github.com/leapfrogtechnology/sync-db/pull/101) ([cham11ng](https://github.com/cham11ng))
- Upgrade vulnerable packages [\#99](https://github.com/leapfrogtechnology/sync-db/pull/99) ([mesaugat](https://github.com/mesaugat))
- Update script to auto generate changelog [\#98](https://github.com/leapfrogtechnology/sync-db/pull/98) ([samirsilwal](https://github.com/samirsilwal))
- Integrate dry run feature by introducing `--dry-run` flag [\#94](https://github.com/leapfrogtechnology/sync-db/pull/94) ([cham11ng](https://github.com/cham11ng))

## [v1.0.0-beta.7](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.7) (2021-03-09)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.20200628...v1.0.0-beta.7)

**Closed Issues**

- Remove support for Node 10 [\#89](https://github.com/leapfrogtechnology/sync-db/issues/89)

**Changes**

- FIX - Tag package only after deploy stage [\#97](https://github.com/leapfrogtechnology/sync-db/pull/97) ([samirsilwal](https://github.com/samirsilwal))
- Update package version =\> 1.0.0-beta.6 [\#96](https://github.com/leapfrogtechnology/sync-db/pull/96) ([samirsilwal](https://github.com/samirsilwal))
- Automate sync-db release [\#93](https://github.com/leapfrogtechnology/sync-db/pull/93) ([samirsilwal](https://github.com/samirsilwal))
- Support JS/TS migration support for sync-db [\#88](https://github.com/leapfrogtechnology/sync-db/pull/88) ([samirsilwal](https://github.com/samirsilwal))
- Bump lodash from 4.17.15 to 4.17.20 [\#87](https://github.com/leapfrogtechnology/sync-db/pull/87) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ini from 1.3.5 to 1.3.8 in /examples/node-app-mssql [\#86](https://github.com/leapfrogtechnology/sync-db/pull/86) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ini from 1.3.5 to 1.3.8 [\#85](https://github.com/leapfrogtechnology/sync-db/pull/85) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ini from 1.3.5 to 1.3.8 in /examples/node-app-pg [\#84](https://github.com/leapfrogtechnology/sync-db/pull/84) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ini from 1.3.5 to 1.3.8 in /examples/node-mssql-programmatic-use [\#83](https://github.com/leapfrogtechnology/sync-db/pull/83) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node-fetch from 2.6.0 to 2.6.1 [\#79](https://github.com/leapfrogtechnology/sync-db/pull/79) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump yargs-parser from 13.1.1 to 13.1.2 [\#78](https://github.com/leapfrogtechnology/sync-db/pull/78) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump bl from 2.2.0 to 2.2.1 in /examples/node-mssql-programmatic-use [\#77](https://github.com/leapfrogtechnology/sync-db/pull/77) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump bl from 2.2.0 to 2.2.1 in /examples/node-app-mssql [\#76](https://github.com/leapfrogtechnology/sync-db/pull/76) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump codecov from 3.6.5 to 3.7.1 [\#75](https://github.com/leapfrogtechnology/sync-db/pull/75) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.15 to 4.17.19 in /examples/node-app-pg [\#74](https://github.com/leapfrogtechnology/sync-db/pull/74) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.15 to 4.17.19 in /examples/node-mssql-programmatic-use [\#73](https://github.com/leapfrogtechnology/sync-db/pull/73) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.14 to 4.17.19 [\#72](https://github.com/leapfrogtechnology/sync-db/pull/72) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.15 to 4.17.19 in /examples/node-app-mssql [\#71](https://github.com/leapfrogtechnology/sync-db/pull/71) ([dependabot[bot]](https://github.com/apps/dependabot))
- Breaking changes - migrations, multi-commands and more experimental changes [\#62](https://github.com/leapfrogtechnology/sync-db/pull/62) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.20200628](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.20200628) (2020-06-28)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.20200607...v1.0.0-experimental.20200628)

**Closed Issues**

- Ability to use a custom connection resolver [\#32](https://github.com/leapfrogtechnology/sync-db/issues/32)

**Changes**

- Provide configuration as an arg to the connection resolver's resolve function [\#70](https://github.com/leapfrogtechnology/sync-db/pull/70) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.20200607](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.20200607) (2020-06-07)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.20200428...v1.0.0-experimental.20200607)

**Implemented enhancements:**

- Split unit tests and cli tests and add separate yarn scripts [\#67](https://github.com/leapfrogtechnology/sync-db/pull/67) ([kabirbaidhya](https://github.com/kabirbaidhya))

**Changes**

- Support connection resolver [\#69](https://github.com/leapfrogtechnology/sync-db/pull/69) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Introduce make command to generate migration files [\#68](https://github.com/leapfrogtechnology/sync-db/pull/68) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.20200428](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.20200428) (2020-04-27)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.20200427...v1.0.0-experimental.20200428)

**Changes**

- Change the basePath to be the base directory for the whole codebase not just sql \(breaking change\) [\#66](https://github.com/leapfrogtechnology/sync-db/pull/66) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Make connections config consistent with Knex's config \(breaking change\) [\#65](https://github.com/leapfrogtechnology/sync-db/pull/65) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.20200427](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.20200427) (2020-04-27)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.6...v1.0.0-experimental.20200427)

**Changes**

- Ability to run all commands for a specific connection using a CLI option \(--only\) [\#64](https://github.com/leapfrogtechnology/sync-db/pull/64) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Update node-app-mssql example to use new SQL migrations [\#63](https://github.com/leapfrogtechnology/sync-db/pull/63) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Upgrade prettier and reformat code [\#61](https://github.com/leapfrogtechnology/sync-db/pull/61) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Drop Node 8.x support - minimum required version \>= 10.x [\#60](https://github.com/leapfrogtechnology/sync-db/pull/60) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Transition to multi commands CLI [\#58](https://github.com/leapfrogtechnology/sync-db/pull/58) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Organize directories and minor improvements for consistency and trivial fixes [\#57](https://github.com/leapfrogtechnology/sync-db/pull/57) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Migrations support [\#51](https://github.com/leapfrogtechnology/sync-db/pull/51) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-beta.6](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.6) (2020-03-24)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.5...v1.0.0-beta.6)

**Changes**

- Setup prettier and integrate format checking in the CI [\#56](https://github.com/leapfrogtechnology/sync-db/pull/56) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Support both sequential and parallel execution strategies for running synchronization [\#55](https://github.com/leapfrogtechnology/sync-db/pull/55) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Bump acorn from 7.1.0 to 7.1.1 in /examples/node-mssql-programmatic-use [\#54](https://github.com/leapfrogtechnology/sync-db/pull/54) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump acorn from 7.1.0 to 7.1.1 in /examples/node-app-pg [\#53](https://github.com/leapfrogtechnology/sync-db/pull/53) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump acorn from 7.0.0 to 7.1.1 in /examples/node-app-mssql [\#52](https://github.com/leapfrogtechnology/sync-db/pull/52) ([dependabot[bot]](https://github.com/apps/dependabot))
- Support resolution of local project dependencies when CLI is invoked in development mode [\#50](https://github.com/leapfrogtechnology/sync-db/pull/50) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Add license scan report and status [\#49](https://github.com/leapfrogtechnology/sync-db/pull/49) ([fossabot](https://github.com/fossabot))

## [v1.0.0-beta.5](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.5) (2020-03-08)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.4...v1.0.0-beta.5)

**Changes**

- Bump knex version to 0.20.11 [\#48](https://github.com/leapfrogtechnology/sync-db/pull/48) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-beta.4](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.4) (2020-03-05)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.3...v1.0.0-beta.4)

**Bug Fixes**

- Fix ramda merge convert issue ¯\\(ツ\)/¯ [\#47](https://github.com/leapfrogtechnology/sync-db/pull/47) ([cham11ng](https://github.com/cham11ng))

## [v1.0.0-beta.3](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.3) (2020-03-03)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.2...v1.0.0-beta.3)

**Bug Fixes**

- Fix fs.exists\(\) util ¯\\_\(ツ\)\_/¯ [\#46](https://github.com/leapfrogtechnology/sync-db/pull/46) ([cham11ng](https://github.com/cham11ng))

## [v1.0.0-beta.2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.2) (2020-03-02)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-beta.1...v1.0.0-beta.2)

**Changes**

- Support resolving connections from the environment directly as a fallback option [\#45](https://github.com/leapfrogtechnology/sync-db/pull/45) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-beta.1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-beta.1) (2020-02-26)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.9-2...v1.0.0-beta.1)

**Changes**

- Add new io utility for standard I/O operations [\#44](https://github.com/leapfrogtechnology/sync-db/pull/44) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Bump codecov from 3.6.1 to 3.6.5 [\#43](https://github.com/leapfrogtechnology/sync-db/pull/43) ([dependabot[bot]](https://github.com/apps/dependabot))
- Run synchronize in a single transaction per connection [\#39](https://github.com/leapfrogtechnology/sync-db/pull/39) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Update example to demonstrate config injection [\#37](https://github.com/leapfrogtechnology/sync-db/pull/37) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-experimental.9-2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.9-2) (2020-02-15)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.9-1...v1.0.0-experimental.9-2)

## [v1.0.0-experimental.9-1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.9-1) (2020-02-15)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.9...v1.0.0-experimental.9-1)

## [v1.0.0-alpha.9](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.9) (2020-02-04)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-6...v1.0.0-alpha.9)

**Implemented enhancements:**

- CLI arg to generate connections from the environment [\#33](https://github.com/leapfrogtechnology/sync-db/pull/33) ([p0k8h](https://github.com/p0k8h))

**Changes**

- Avoid vendor specific defaults in the config [\#41](https://github.com/leapfrogtechnology/sync-db/pull/41) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Generate connection with port as number when using --generate-connections CLI arg [\#40](https://github.com/leapfrogtechnology/sync-db/pull/40) ([silwalanish](https://github.com/silwalanish))
- Update dependencies - typescript & tslint [\#38](https://github.com/leapfrogtechnology/sync-db/pull/38) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Config Injection - ability to inject dynamic configurations such that the running SQL transactions could access them [\#36](https://github.com/leapfrogtechnology/sync-db/pull/36) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Add example project for postgres [\#35](https://github.com/leapfrogtechnology/sync-db/pull/35) ([Prabeshpd](https://github.com/Prabeshpd))

## [v1.0.0-experimental.8-6](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-experimental.8-6) (2020-02-03)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-experimental.8-5...v1.0.0-experimental.8-6)

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

**Closed Issues**

- New CLI arg to generate connections file using the environment variables [\#31](https://github.com/leapfrogtechnology/sync-db/issues/31)
- Add new example project based on postgres [\#25](https://github.com/leapfrogtechnology/sync-db/issues/25)

## [v1.0.0-alpha.8](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.8) (2019-12-18)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.7...v1.0.0-alpha.8)

**Changes**

- Bump knex to version 0.20.4 and upgrade vulnerable packages [\#34](https://github.com/leapfrogtechnology/sync-db/pull/34) ([mesaugat](https://github.com/mesaugat))

## [v1.0.0-alpha.7](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.7) (2019-12-11)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.6...v1.0.0-alpha.7)

**Implemented enhancements:**

- Setup docker and docker-compose configuration for the node-app-mssql example [\#23](https://github.com/leapfrogtechnology/sync-db/pull/23) ([silwalanish](https://github.com/silwalanish))

**Bug Fixes**

- Logs are misleading in rollback / teardown stage [\#5](https://github.com/leapfrogtechnology/sync-db/issues/5)

**Security fixes:**

- Upgrade knex minimum version to 0.19.5 [\#26](https://github.com/leapfrogtechnology/sync-db/pull/26) ([kabirbaidhya](https://github.com/kabirbaidhya))

**Closed Issues**

- Add sample tables using knex migrations for the node-app-mssql example [\#21](https://github.com/leapfrogtechnology/sync-db/issues/21)
- CI - Integrate test code coverage reporting. [\#18](https://github.com/leapfrogtechnology/sync-db/issues/18)
- Add an example with showing the programmatic usage in Node / JavaScript [\#12](https://github.com/leapfrogtechnology/sync-db/issues/12)
- Setup docker and docker-compose configuration for the node-app-mssql example [\#8](https://github.com/leapfrogtechnology/sync-db/issues/8)

**Changes**

- Fix file name mistake [\#30](https://github.com/leapfrogtechnology/sync-db/pull/30) ([p0k8h](https://github.com/p0k8h))
- Added an example showing programmatic usuage of sync-db Node/JS [\#29](https://github.com/leapfrogtechnology/sync-db/pull/29) ([p0k8h](https://github.com/p0k8h))
- Throw an error if object type names doesn't match directory convention [\#28](https://github.com/leapfrogtechnology/sync-db/pull/28) ([p0k8h](https://github.com/p0k8h))
- Upgrade TypeScript to 3.7.2 [\#27](https://github.com/leapfrogtechnology/sync-db/pull/27) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Use knex to create, run, rollback migrations with samples [\#24](https://github.com/leapfrogtechnology/sync-db/pull/24) ([p0k8h](https://github.com/p0k8h))
- Integrate test code coverage reporting with Codecov and Travis. [\#19](https://github.com/leapfrogtechnology/sync-db/pull/19) ([ghost](https://github.com/ghost))

## [v1.0.0-alpha.6](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.6) (2019-08-28)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.5...v1.0.0-alpha.6)

**Changes**

-  Downgrade knex version to 0.16.3 [\#16](https://github.com/leapfrogtechnology/sync-db/pull/16) ([SafalPandey](https://github.com/SafalPandey))

## [v1.0.0-alpha.5](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.5) (2019-08-28)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.4...v1.0.0-alpha.5)

**Implemented enhancements:**

- Support knex transactions in synchronize [\#15](https://github.com/leapfrogtechnology/sync-db/pull/15) ([SafalPandey](https://github.com/SafalPandey))

## [v1.0.0-alpha.4](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.4) (2019-08-27)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.3...v1.0.0-alpha.4)

**Changes**

- Configure Travis CI for running tests [\#13](https://github.com/leapfrogtechnology/sync-db/pull/13) ([kabirbaidhya](https://github.com/kabirbaidhya))
- Simplify programmatic usage and documentation [\#11](https://github.com/leapfrogtechnology/sync-db/pull/11) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-alpha.3](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.3) (2019-08-26)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.2...v1.0.0-alpha.3)

**Implemented enhancements:**

- Enable passing connection instance as well as connection config for synchronization [\#10](https://github.com/leapfrogtechnology/sync-db/pull/10) ([SafalPandey](https://github.com/SafalPandey))

**Changes**

- Improvements on the README Documentation [\#7](https://github.com/leapfrogtechnology/sync-db/pull/7) ([kabirbaidhya](https://github.com/kabirbaidhya))

## [v1.0.0-alpha.2](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.2) (2019-08-09)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/v1.0.0-alpha.1...v1.0.0-alpha.2)

**Changes**

- Remove password attribute from connections object before logging [\#6](https://github.com/leapfrogtechnology/sync-db/pull/6) ([SafalPandey](https://github.com/SafalPandey))
- Set published source for sync-db [\#4](https://github.com/leapfrogtechnology/sync-db/pull/4) ([shradayshakya](https://github.com/shradayshakya))

## [v1.0.0-alpha.1](https://github.com/leapfrogtechnology/sync-db/tree/v1.0.0-alpha.1) (2019-08-07)

[Full Changelog](https://github.com/leapfrogtechnology/sync-db/compare/f669c693d4e139e20711d981516ec1734a6198a5...v1.0.0-alpha.1)

**Implemented enhancements:**

- Refactor code for accessing database connections. [\#1](https://github.com/leapfrogtechnology/sync-db/pull/1) ([shradayshakya](https://github.com/shradayshakya))

**Changes**

- Add documentation for global installation [\#2](https://github.com/leapfrogtechnology/sync-db/pull/2) ([shradayshakya](https://github.com/shradayshakya))



\* *This Changelog was automatically generated       by [github_changelog_generator]      (https://github.com/github-changelog-generator/github-changelog-generator)*
