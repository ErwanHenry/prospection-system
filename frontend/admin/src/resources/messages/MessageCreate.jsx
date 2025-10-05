import { useState } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceInput,
  NumberInput,
  required,
} from 'react-admin';
import { TipTapEditor } from '../../components/TipTapEditor';

const typeChoices = [
  { id: 'FIRST_CONTACT', name: 'Premier contact' },
  { id: 'FOLLOW_UP_1', name: 'Relance 1' },
  { id: 'FOLLOW_UP_2', name: 'Relance 2' },
  { id: 'FOLLOW_UP_3', name: 'Relance 3' },
];

export const MessageCreate = () => {
  const [body, setBody] = useState('');

  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="campaignId" reference="campaigns" label="Campagne">
          <SelectInput optionText="name" validate={required()} fullWidth />
        </ReferenceInput>

        <SelectInput
          source="type"
          choices={typeChoices}
          label="Type de message"
          validate={required()}
          fullWidth
        />

        <TextInput
          source="subject"
          label="Sujet (pour emails)"
          helperText="Laissez vide pour messages LinkedIn"
          fullWidth
        />

        <NumberInput
          source="delayDays"
          label="Délai en jours après le message précédent"
          defaultValue={0}
          helperText="0 = envoi immédiat"
          fullWidth
        />

        <div style={{ marginTop: 16 }}>
          <label>Corps du message</label>
          <TipTapEditor value={body} onChange={setBody} />
          <input type="hidden" name="body" value={body} />
        </div>
      </SimpleForm>
    </Create>
  );
};
