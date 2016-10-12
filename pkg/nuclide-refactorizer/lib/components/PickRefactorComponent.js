'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Store,
  PickPhase,
} from '../types';

import type {AvailableRefactoring} from '../..';

import {React} from 'react-for-atom';

import {Button} from '../../../nuclide-ui/Button';

import * as Actions from '../refactorActions';

export class PickRefactorComponent extends React.Component {
  props: {
    pickPhase: PickPhase,
    store: Store
  };

  render(): React.Element<any> {
    const elements = this.props.pickPhase.availableRefactorings
      .map((r, i) => <div key={i}>{this._renderRefactorOption(r)}</div>);
    return <div>{elements}</div>;
  }

  _pickRefactor(refactoring: AvailableRefactoring): void {
    this.props.store.dispatch(Actions.pickedRefactor(refactoring));
  }

  _renderRefactorOption(refactoring: AvailableRefactoring): React.Element<any> {
    switch (refactoring.kind) {
      case 'rename':
        return <Button onClick={() => { this._pickRefactor(refactoring); }}>Rename</Button>;
      default:
        throw new Error(`Unknown refactoring kind ${refactoring.kind}`);
    }
  }
}
