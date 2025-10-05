import {
  Edit,
  TabbedForm,
  FormTab,
  TextInput,
  SelectInput,
  ReferenceInput,
  ArrayInput,
  SimpleFormIterator,
  DateInput,
  NumberInput,
  BooleanInput,
  ReferenceManyField,
  Datagrid,
  TextField,
  DateField,
  required,
} from 'react-admin';

const statusChoices = [
  { id: 'TO_CONTACT', name: 'À contacter' },
  { id: 'CONTACTED', name: 'Contacté' },
  { id: 'RESPONDED', name: 'A répondu' },
  { id: 'QUALIFIED', name: 'Qualifié' },
  { id: 'CONVERTED', name: 'Converti' },
  { id: 'REJECTED', name: 'Rejeté' },
];

const priorityChoices = [
  { id: 'LOW', name: 'Basse' },
  { id: 'MEDIUM', name: 'Moyenne' },
  { id: 'HIGH', name: 'Haute' },
  { id: 'URGENT', name: 'Urgent' },
];

export const ProspectEdit = () => (
  <Edit>
    <TabbedForm>
      <FormTab label="Profil">
        <TextInput source="firstName" label="Prénom" fullWidth />
        <TextInput source="lastName" label="Nom" fullWidth />
        <TextInput source="fullName" label="Nom complet" validate={required()} fullWidth />
        <TextInput source="company" label="Entreprise" fullWidth />
        <TextInput source="jobTitle" label="Poste" fullWidth />
        <TextInput source="location" label="Localisation" fullWidth />
        <TextInput source="linkedinUrl" label="URL LinkedIn" fullWidth />
        <TextInput source="bio" label="Bio" multiline rows={3} fullWidth />
      </FormTab>

      <FormTab label="Contact">
        <TextInput source="email" label="Email" fullWidth />
        <NumberInput source="emailScore" label="Score email (0-100)" fullWidth />
        <TextInput source="phone" label="Téléphone" fullWidth />
      </FormTab>

      <FormTab label="CRM">
        <ReferenceInput source="campaignId" reference="campaigns" label="Campagne">
          <SelectInput optionText="name" fullWidth />
        </ReferenceInput>
        <SelectInput source="status" choices={statusChoices} label="Statut" fullWidth />
        <SelectInput source="priority" choices={priorityChoices} label="Priorité" fullWidth />
        <ArrayInput source="tags" label="Tags">
          <SimpleFormIterator inline>
            <TextInput source="" label="" />
          </SimpleFormIterator>
        </ArrayInput>
        <TextInput source="notes" label="Notes" multiline rows={4} fullWidth />
        <DateInput source="lastContactedAt" label="Dernier contact" fullWidth />
        <NumberInput source="messagesSent" label="Messages envoyés" fullWidth />
        <BooleanInput source="responded" label="A répondu" />
      </FormTab>

      <FormTab label="Activité">
        <ReferenceManyField reference="activities" target="prospectId" label="Historique">
          <Datagrid bulkActionButtons={false}>
            <TextField source="type" label="Type" />
            <TextField source="message" label="Message" />
            <DateField source="createdAt" label="Date" showTime />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
    </TabbedForm>
  </Edit>
);
