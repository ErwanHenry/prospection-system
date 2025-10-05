import {
  List,
  Datagrid,
  TextField,
  SelectField,
  ReferenceField,
  NumberField,
  DateField,
  ChipField,
} from 'react-admin';

const typeChoices = [
  { id: 'FIRST_CONTACT', name: 'Premier contact' },
  { id: 'FOLLOW_UP_1', name: 'Relance 1' },
  { id: 'FOLLOW_UP_2', name: 'Relance 2' },
  { id: 'FOLLOW_UP_3', name: 'Relance 3' },
];

export const MessageList = () => (
  <List sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="edit">
      <ReferenceField source="campaignId" reference="campaigns" label="Campagne">
        <TextField source="name" />
      </ReferenceField>
      <SelectField source="type" choices={typeChoices} label="Type" />
      <TextField source="subject" label="Sujet" />
      <NumberField source="delayDays" label="Délai (jours)" />
      <DateField source="createdAt" label="Créé le" showTime />
    </Datagrid>
  </List>
);
