import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { Box, Button, ButtonGroup, Paper, Chip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const variables = [
  { id: 'firstName', label: 'Prénom' },
  { id: 'lastName', label: 'Nom' },
  { id: 'fullName', label: 'Nom complet' },
  { id: 'company', label: 'Entreprise' },
  { id: 'jobTitle', label: 'Poste' },
  { id: 'location', label: 'Localisation' },
  { id: 'calendlyLink', label: 'Lien Calendly' },
];

export const TipTapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return variables
              .filter((item) =>
                item.label.toLowerCase().startsWith(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let component;
            let popup;

            return {
              onStart: (props) => {
                component = {
                  items: props.items,
                  command: props.command,
                };
              },
              onUpdate(props) {
                component.items = props.items;
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup?.remove();
                  return true;
                }
                return false;
              },
              onExit() {
                popup?.remove();
              },
            };
          },
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertVariable = (varId) => {
    editor?.chain().focus().insertContent(`{{${varId}}}`).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <ButtonGroup size="small" sx={{ mb: 2 }}>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive('bold') ? 'contained' : 'outlined'}
        >
          <FormatBoldIcon />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive('italic') ? 'contained' : 'outlined'}
        >
          <FormatItalicIcon />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
        >
          <FormatListBulletedIcon />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
        >
          <FormatListNumberedIcon />
        </Button>
      </ButtonGroup>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ mb: 1 }}>Variables disponibles (cliquez pour insérer) :</Box>
        {variables.map((v) => (
          <Chip
            key={v.id}
            label={v.label}
            onClick={() => insertVariable(v.id)}
            sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>

      <Box
        sx={{
          border: '1px solid #ddd',
          borderRadius: 1,
          p: 2,
          minHeight: 200,
          '& .ProseMirror': {
            outline: 'none',
          },
          '& .mention': {
            backgroundColor: '#e3f2fd',
            borderRadius: 1,
            padding: '2px 6px',
            fontWeight: 'bold',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
};
