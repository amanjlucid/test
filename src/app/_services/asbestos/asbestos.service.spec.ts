import { TestBed } from '@angular/core/testing';

import { AsbestosService } from './asbestos.service';

describe('AsbestosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AsbestosService = TestBed.get(AsbestosService);
    expect(service).toBeTruthy();
  });
});
