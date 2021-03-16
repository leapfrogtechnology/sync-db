import { expect } from 'chai';
import { it, describe } from 'mocha';

import { timeout } from '../../../src/util/promise';
import Configuration from '../../../src/domain/Configuration';
import * as executionService from '../../../src/service/execution';

const getProcesses = (tracker: string[]) => [
  () =>
    timeout(45)
      .then(() => tracker.push('Task A'))
      .then(() => 'Task A'),
  () =>
    timeout(50)
      .then(() => tracker.push('Task B'))
      .then(() => 'Task B'),
  () =>
    timeout(39)
      .then(() => tracker.push('Task C'))
      .then(() => 'Task C'),
  () =>
    timeout(40)
      .then(() => tracker.push('Task D'))
      .then(() => 'Task D')
];

describe('SERVICE: execution', () => {
  describe('executeProcesses', () => {
    it('should run sequentially with [strategy = sequential].', async () => {
      const tracker: string[] = [];
      const processes = getProcesses(tracker);

      const result = await executionService.executeProcesses(processes, {
        execution: 'sequential'
      } as Configuration);

      expect(result).to.deep.equal(['Task A', 'Task B', 'Task C', 'Task D']);
      expect(tracker).to.deep.equal(['Task A', 'Task B', 'Task C', 'Task D']);
    });

    it('should run in-parallel with [strategy = parallel].', async () => {
      const tracker: string[] = [];
      const processes = getProcesses(tracker);

      const result = await executionService.executeProcesses(processes, {
        execution: 'parallel'
      } as Configuration);

      expect(result).to.have.deep.members(['Task A', 'Task B', 'Task C', 'Task D']);
      expect(tracker).to.have.deep.members(['Task C', 'Task D', 'Task A', 'Task B']);
    });

    it('should throw an error if unknown strategy is provided.', () => {
      const processes = getProcesses([]);

      expect(() => executionService.executeProcesses(processes, { execution: 'future' } as any)).to.throw(
        'Execution strategy should be "sequential" or "parallel" found: "future".'
      );
    });

    it('should throw an error if caught with [strategy = sequential].', async () => {
      const processes = [
        () => Promise.resolve('one'),
        () => Promise.reject(new Error('An error occurred.')),
        () => Promise.resolve('three'),
        () => Promise.reject(new Error('A second error occurred.')),
        async () => {
          throw new Error('Another error occurred.');
        }
      ];

      expect(
        executionService.executeProcesses(processes, { execution: 'sequential' } as any)
      ).to.be.eventually.rejectedWith('An error occurred.');
    });

    it('should throw an error if caught with [strategy = parallel].', async () => {
      const processes = [
        () => Promise.resolve('one'),
        () => Promise.reject(new Error('An error occurred.')),
        () => Promise.resolve('three'),
        () => Promise.reject(new Error('A second error occurred.')),
        async () => {
          throw new Error('Another error occurred.');
        }
      ];

      expect(
        executionService.executeProcesses(processes, { execution: 'parallel' } as any)
      ).to.be.eventually.rejectedWith('An error occurred.');
    });
  });
});
