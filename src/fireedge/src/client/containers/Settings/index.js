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
import { Container, Paper, Box, Typography, Divider } from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import FormWithSchema from 'client/components/Forms/FormWithSchema'
import SubmitButton from 'client/components/FormControl/SubmitButton'

import { useAuth } from 'client/features/Auth'
import { useLazyGetAuthUserQuery } from 'client/features/AuthApi'
import { useUpdateUserMutation } from 'client/features/OneApi/user'
import { useGeneralApi } from 'client/features/General'
import { Translate, Tr } from 'client/components/HOC'
import { T } from 'client/constants'

import { FORM_FIELDS, FORM_SCHEMA } from 'client/containers/Settings/schema'
import * as Helper from 'client/models/Helper'

/** @returns {ReactElement} Settings container */
const Settings = () => {
  const { user, settings } = useAuth()
  const [getAuthUser] = useLazyGetAuthUserQuery()
  const [updateUser] = useUpdateUserMutation()
  const { enqueueError } = useGeneralApi()

  const { handleSubmit, reset, formState, ...methods } = useForm({
    reValidateMode: 'onSubmit',
    defaultValues: useMemo(() => FORM_SCHEMA.cast(settings), [settings]),
    resolver: yupResolver(FORM_SCHEMA),
  })

  const onSubmit = async (formData) => {
    try {
      const data = FORM_SCHEMA.cast(formData, { isSubmit: true })
      const template = Helper.jsonToXml({ FIREEDGE: data })
      await updateUser({ id: user.ID, template })
      await getAuthUser()

      // Reset either the entire form state or part of the form state
      reset(formData)
    } catch {
      enqueueError(T.SomethingWrong)
    }
  }

  return (
    <Container disableGutters>
      <Typography variant="h5" pt="1em">
        <Translate word={T.Settings} />
      </Typography>

      <Divider sx={{ my: '1em' }} />

      <Paper
        variant="outlined"
        sx={{
          p: '1em',
          maxWidth: { sm: 'auto', md: 550 },
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <FormWithSchema
              cy="settings"
              fields={FORM_FIELDS}
              legend={T.ConfigurationUI}
            />
          </FormProvider>
          <Box py="1em" textAlign="end">
            <SubmitButton
              color="secondary"
              data-cy="settings-submit-button"
              label={Tr(T.Save)}
              onClick={handleSubmit}
              disabled={!formState.isDirty}
              isSubmitting={formState.isSubmitting}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default Settings
