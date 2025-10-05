import { useState, useEffect } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceInput,
  NumberInput,
  required,
  useRecordContext,
} from 'react-admin';
import { TipTapEditor } from '../../components/TipTapEditor';

const typeChoices = [
  { id: 'FIRST_CONTACT', name: 'Premier contact' },
  { id: 'FOLLOW_UP_1', name: 'Relance 1' },
  { id: 'FOLLOW_UP_2', name: 'Relance 2' },
  { id: 'FOLLOW_UP_3', name: 'Relance 3' },
];

const MessageFormContent = () => {
  const record = useRecordContext();
  const [body, setBody] = useState(record?.body || '');

  useEffect(() => {
    if (record?.body) {
      setBody(record.body);
    }
  }, [record]);

  return (
    <>
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

      <TextInput source="subject" label="Sujet (pour emails)" fullWidth />

      <NumberInput source="delayDays" label="Délai en jours" fullWidth />

      <div style={{ marginTop: 16 }}>
        <label>Corps du message</label>
        <TipTapEditor value={body} onChange={setBody} />
        <input type="hidden" name="body" value={body} />
      </div>
    </>
  );
};

export const MessageEdit = () => (
  <Edit>
    <SimpleForm>
      <MessageFormContent />
    </SimpleForm>
  </Edit>
);
