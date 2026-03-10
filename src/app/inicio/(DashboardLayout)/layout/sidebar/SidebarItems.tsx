"use client";
import React from "react";
import Menuitems from "./MenuItems";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";
import { IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const renderMenuItems = (items: any, pathDirect: any) => {
  return items.map((item: any) => {
    const Icon = item.icon ? item.icon : IconAperture;

    if (item.subheader) {
      return (
        <Box key={item.subheader}>
          <Typography variant="overline" fontWeight="600" sx={{ ml: 2, mt: 2 }}>
            {item.subheader}
          </Typography>
        </Box>
      );
    }

    if (item.children) {
      const [open, setOpen] = useState(false);
      return (
        <React.Fragment key={item.id}>
          <ListItem sx={{ py: 1 }}>
            <ListItemButton
              sx={{ justifyContent: "space-between", py: 1 }}
              onClick={() => setOpen(!open)}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List
              component="div"
              disablePadding
              sx={{ ml: 2 }}
            >
              {renderMenuItems(item.children, pathDirect)}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <Box key={item.id}>
        <ListItem sx={{ py: 1 }}>
          <ListItemButton
            component={Link}
            href={item.href}
            sx={{
              borderRadius: '8px',
              backgroundColor: pathDirect === item.href ? 'rgba(93, 135, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(93, 135, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        </ListItem>
      </Box>
    );
  });
};

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;

  return (
    <Box>
      <Box sx={{ p: 2 }}>
        <Link href="/" passHref>
          <Box
            component="a"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src="/logomiranda.jpeg"
              alt="Logo"
              height="40"
              width="120"
              style={{ objectFit: 'contain' }}
            />

          </Box>
        </Link>
      </Box>
      <List sx={{ mt: 2 }}>
        {renderMenuItems(Menuitems, pathDirect)}
      </List>
    </Box>
  );
};

export default SidebarItems;
