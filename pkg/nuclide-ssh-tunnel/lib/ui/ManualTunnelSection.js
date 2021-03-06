/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Tunnel} from 'nuclide-adb/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import invariant from 'assert';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import * as React from 'react';
import {Button} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Section} from 'nuclide-commons-ui/Section';
import {shortenHostname} from '../../../nuclide-socket-rpc/lib/Tunnel';

type Props = {
  openTunnel(tunnel: Tunnel): void,
  workingDirectoryHost: 'localhost' | ?NuclideUri,
};
type State = {
  description: string,
  family: 4 | 6,
  fromCurrentWorkingRoot: boolean,
  fromPortString: string,
  toPortString: string,
  fromPort?: number,
  toPort?: number,
};

export default class ManualTunnelSection extends React.Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      description: '',
      family: 6,
      fromCurrentWorkingRoot: true,
      fromPortString: '',
      toPortString: '',
    };
  }

  render(): React.Element<any> {
    let boxContents;

    if (
      this.props.workingDirectoryHost == null ||
      this.props.workingDirectoryHost === 'localhost'
    ) {
      boxContents =
        'Set a remote Current Working Root to open tunnels to that host.';
    } else {
      boxContents = this._getManualEntryForm(this.props.workingDirectoryHost);
    }

    return (
      <Section headline="Manual tunnel" collapsable={false}>
        <div className="nuclide-ssh-tunnels-manual-tunnel-section">
          {boxContents}
        </div>
      </Section>
    );
  }

  _getManualEntryForm(hostname: NuclideUri): Array<React.Element<any>> {
    const workingRootLabel = (
      <code className="nuclide-ssh-tunnels-manual-tunnel-section-host-field">
        {shortenHostname(hostname)}:
      </code>
    );
    const localhostLabel = (
      <code className="nuclide-ssh-tunnels-manual-tunnel-section-host-field">
        localhost:
      </code>
    );
    const fromAndToRow = (
      <div className="nuclide-ssh-tunnels-manual-tunnel-section-row">
        <div>
          {this.state.fromCurrentWorkingRoot
            ? workingRootLabel
            : localhostLabel}
          <AtomInput
            placeholderText="port"
            value={this.state.fromPortString}
            size="sm"
            width={40}
            onDidChange={text =>
              this.setState({
                fromPortString: text,
                fromPort: this._parsePort(text),
              })
            }
          />
        </div>
        <Button onClick={() => this._switchToAndFrom()}>⇄</Button>
        <div>
          {this.state.fromCurrentWorkingRoot
            ? localhostLabel
            : workingRootLabel}
          <AtomInput
            placeholderText="port"
            value={this.state.toPortString}
            size="sm"
            width={40}
            onDidChange={text =>
              this.setState({
                toPortString: text,
                toPort: this._parsePort(text),
              })
            }
          />
        </div>
      </div>
    );
    const descriptionFamilyOpenRow = (
      <div className="nuclide-ssh-tunnels-manual-tunnel-section-row">
        <AtomInput
          placeholderText="description"
          className="nuclide-ssh-tunnels-manual-tunnel-section-description"
          size="sm"
          style={{'flex-grow': 1}}
          onDidChange={description => this.setState({description})}
        />
        <ButtonGroup>
          <Button
            key="4"
            selected={this.state.family === 4}
            onClick={() => this.setState({family: 4})}>
            IPv4
          </Button>
          <Button
            key="6"
            selected={this.state.family === 6}
            onClick={() => this.setState({family: 6})}>
            IPv6
          </Button>
        </ButtonGroup>
        <Button
          disabled={!this._openButtonEnabled()}
          onClick={() => this._openTunnel()}>
          Open
        </Button>
      </div>
    );
    return [fromAndToRow, descriptionFamilyOpenRow];
  }

  _openTunnel(): void {
    invariant(
      this.props.workingDirectoryHost != null &&
        this.props.workingDirectoryHost !== 'localhost' &&
        this.state.fromPort != null &&
        this.state.toPort != null,
    );
    const fromHost = this.state.fromCurrentWorkingRoot
      ? this.props.workingDirectoryHost
      : 'localhost';
    const toHost = this.state.fromCurrentWorkingRoot
      ? 'localhost'
      : this.props.workingDirectoryHost;
    const tunnel = {
      from: {
        host: fromHost,
        port: this.state.fromPort,
        family: this.state.family,
      },
      to: {
        host: toHost,
        port: this.state.toPort,
        family: this.state.family,
      },
      description: this.state.description.trim() || 'manual',
    };

    this.props.openTunnel(tunnel);
  }

  _openButtonEnabled(): boolean {
    return (
      this.props.workingDirectoryHost != null &&
      this.props.workingDirectoryHost !== 'localhost' &&
      this.state.fromPort != null &&
      this.state.toPort != null
    );
  }

  _switchToAndFrom(): void {
    this.setState({
      fromCurrentWorkingRoot: !this.state.fromCurrentWorkingRoot,
      fromPortString: this.state.toPortString,
      toPortString: this.state.fromPortString,
      fromPort: this.state.toPort,
      toPort: this.state.fromPort,
    });
  }

  _parsePort(text: string): number | void {
    const port = parseInt(text, 10);
    if (!(port >= 0 && port <= 65535)) {
      return undefined;
    } else {
      return port;
    }
  }
}
