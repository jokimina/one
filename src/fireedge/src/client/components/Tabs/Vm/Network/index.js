/* ------------------------------------------------------------------------- *
 * Copyright 2002-2021, OpenNebula Project, OpenNebula Systems               *
 *                                                                           *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may   *
 * not use this file except in compliance with the License. You may obtain   *
 * a copy of the License at                                                  *
 *                                                                           *
 * http://www.apache.org/licenses/LICENSE-2.0                                *
 *                                                                           *
 * Unless required by applicable law or agreed to in writing, software       *
 * distributed under the License is distributed on an "AS IS" BASIS,         *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  *
 * See the License for the specific language governing permissions and       *
 * limitations under the License.                                            *
 * ------------------------------------------------------------------------- */
import { ReactElement, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Stack } from '@mui/material'

import { useGetVmQuery } from 'client/features/OneApi/vm'
import NicCard from 'client/components/Cards/NicCard'
import {
  AttachAction,
  DetachAction,
} from 'client/components/Tabs/Vm/Network/Actions'

import {
  getNics,
  getHypervisor,
  isAvailableAction,
} from 'client/models/VirtualMachine'
import { getActionsAvailable } from 'client/models/Helper'
import { VM_ACTIONS } from 'client/constants'

const { ATTACH_NIC, DETACH_NIC } = VM_ACTIONS

/**
 * Renders the list of networks from a VM.
 *
 * @param {object} props - Props
 * @param {object} props.tabProps - Tab information
 * @param {string[]} props.tabProps.actions - Actions tab
 * @param {string} props.id - Virtual Machine id
 * @returns {ReactElement} Networks tab
 */
const VmNetworkTab = ({ tabProps: { actions } = {}, id }) => {
  const { data: vm } = useGetVmQuery(id)

  const [nics, hypervisor, actionsAvailable] = useMemo(() => {
    const groupedNics = getNics(vm, {
      groupAlias: true,
      securityGroupsFromTemplate: true,
    })
    const hyperV = getHypervisor(vm)
    const actionsByHypervisor = getActionsAvailable(actions, hyperV)
    const actionsByState = actionsByHypervisor.filter(
      (action) => !isAvailableAction(action)(vm)
    )

    return [groupedNics, hyperV, actionsByState]
  }, [vm])

  return (
    <div>
      {actionsAvailable?.includes?.(ATTACH_NIC) && (
        <AttachAction vmId={id} currentNics={nics} hypervisor={hypervisor} />
      )}

      <Stack direction="column" gap="1em" py="0.8em">
        {nics.map((nic) => {
          const { IP, MAC, ADDRESS } = nic
          const key = IP ?? MAC ?? ADDRESS // address only exists form PCI nics

          return (
            <NicCard
              key={key}
              nic={nic}
              actions={
                actionsAvailable.includes(DETACH_NIC) && (
                  <DetachAction nic={nic} vmId={id} />
                )
              }
            />
          )
        })}
      </Stack>
    </div>
  )
}

VmNetworkTab.propTypes = {
  tabProps: PropTypes.object,
  id: PropTypes.string,
}

VmNetworkTab.displayName = 'VmNetworkTab'

export default VmNetworkTab
